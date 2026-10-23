'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, PenTool, Scale, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useAppState, type MovementType, type OrderRecord } from '@/components/app-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const schools = ['Construcción', 'Mecánica', 'Administración', 'Informática', 'Salud', 'Turismo', 'Naturaleza'];

export default function MovimientosPage() {
  const { role, currentUser, data, setData } = useAppState();
  const [movementType, setMovementType] = useState<MovementType>('PRESTAMO');
  const [assetCode, setAssetCode] = useState('');
  const [school, setSchool] = useState('');
  const [requester, setRequester] = useState('');
  const [run, setRun] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [returnDate, setReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [dateFilter, setDateFilter] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasSignature = useRef(false);

  const eligibleAssets = data.assets.filter((asset) => {
    if (movementType === 'PRESTAMO' || movementType === 'DEVOLUCION') return asset.returnable;
    if (movementType === 'PEDIDO') return !asset.returnable;
    return role === 'ADMIN';
  });
  const selectedAsset = eligibleAssets.find((asset) => asset.code === assetCode) ?? eligibleAssets[0];
  const visibleOrders = useMemo(() => data.orders.filter((order) => {
    const movementName = order.movementType === 'DEVOLUCION' ? 'Devolución' : order.movementType === 'PEDIDO' ? 'Pedido' : order.movementType === 'BAJA' ? 'Baja' : 'Préstamo';
    const queryMatches = `${order.id} ${order.assetName} ${order.requester} ${order.run}`.toLowerCase().includes(query.toLowerCase());
    const typeMatches = typeFilter === 'Todos' || typeFilter === movementName;
    const dateMatches = !dateFilter || order.createdAt.slice(0, 10) === dateFilter;
    return queryMatches && typeMatches && dateMatches;
  }), [data.orders, dateFilter, query, typeFilter]);

  useEffect(() => {
    if (!signatureOpen || !canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) {
      toast.error('No fue posible inicializar el área de firma.');
      return;
    }
    context.strokeStyle = '#0284c7';
    context.lineWidth = 2.5;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    hasSignature.current = false;
  }, [signatureOpen]);

  const prepareSignature = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (role === 'GLOBAL') {
      toast.error('El rol global debe enviar solicitudes desde Pedidos / Catálogo.');
      return;
    }
    if (movementType === 'BAJA' && role !== 'ADMIN') {
      toast.error('Solo el administrador puede registrar bajas.');
      return;
    }
    if (!selectedAsset || !school || !requester.trim() || !notes.trim()) {
      toast.error('Completa todos los campos requeridos.');
      return;
    }
    const qty = Number(quantity);
    const amount = selectedAsset.unitType === 'KG' ? qty / 1000 : qty;
    if (!Number.isFinite(qty) || qty <= 0 || (selectedAsset.unitType === 'UNID' && !Number.isInteger(qty))) {
      toast.error('La cantidad ingresada no es válida.');
      return;
    }
    if ((movementType === 'PRESTAMO' || movementType === 'PEDIDO') && amount > selectedAsset.available) {
      toast.error('Stock insuficiente para registrar el movimiento.');
      return;
    }
    if (movementType === 'DEVOLUCION' && amount > selectedAsset.total - selectedAsset.available) {
      toast.error('La cantidad a devolver supera el stock actualmente prestado.');
      return;
    }
    if (movementType === 'BAJA' && (amount > selectedAsset.available || amount > selectedAsset.total)) {
      toast.error('La cantidad de baja supera el stock disponible.');
      return;
    }
    if (movementType === 'PRESTAMO' && !returnDate) {
      toast.error('Selecciona la fecha límite de retorno.');
      return;
    }
    const member = data.members.find((item) => item.run.toLowerCase() === run.trim().toLowerCase());
    if (member?.blocked) {
      toast.error('El solicitante está bloqueado por morosidad.');
      return;
    }
    setSignatureOpen(true);
  };

  const saveMovement = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) {
      toast.error('No fue posible leer la firma. Intenta nuevamente.');
      return;
    }
    if (!hasSignature.current) {
      toast.error('Firma en el recuadro antes de confirmar el movimiento.');
      return;
    }
    if (!selectedAsset) return;

    const qty = Number(quantity);
    const amount = selectedAsset.unitType === 'KG' ? qty / 1000 : qty;
    const nextSequence = data.orders.reduce((max, order) => {
      const sequence = Number(order.id.match(/\d+$/)?.[0]) || 0;
      return Math.max(max, sequence);
    }, 0) + 1;
    const id = `TRX-${String(nextSequence).padStart(5, '0')}`;
    const now = new Date().toISOString();
    const order: OrderRecord = {
      id,
      assetCode: selectedAsset.code,
      assetName: selectedAsset.name,
      quantity: qty,
      unit: selectedAsset.unitType === 'KG' ? 'g' : 'unid.',
      requester: requester.trim(),
      run: run.trim(),
      email: '',
      school,
      notes: notes.trim(),
      status: 'Recibido',
      movementType,
      createdAt: now,
      returnDate,
      ownerRole: role,
      stockDeducted: movementType === 'PRESTAMO' || movementType === 'PEDIDO',
      history: [{ action: `${movementTypeLabel(movementType)} registrada con firma digital`, actor: currentUser.name, date: now }],
    };

    setData((current) => ({
      ...current,
      assets: current.assets.map((asset) => {
        if (asset.code !== selectedAsset.code) return asset;
        if (movementType === 'DEVOLUCION') return { ...asset, available: Number((asset.available + amount).toFixed(3)) };
        if (movementType === 'BAJA') return { ...asset, total: Number((asset.total - amount).toFixed(3)), available: Number((asset.available - amount).toFixed(3)), status: amount === asset.total ? 'De Baja' : asset.status };
        return { ...asset, available: Number((asset.available - amount).toFixed(3)) };
      }),
      orders: [order, ...current.orders],
    }));
    context.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureOpen(false);
    setRequester('');
    setRun('');
    setNotes('');
    setReturnDate('');
    setQuantity('1');
    toast.success(`Movimiento ${id} registrado y stock actualizado.`);
  };

  const exportMovements = () => {
    const rows = [['Folio', 'Fecha', 'Activo', 'Cantidad', 'Solicitante', 'RUN', 'Escuela', 'Tipo', 'Estado'], ...visibleOrders.map((order) => [
      order.id, order.createdAt, order.assetName, `${order.quantity} ${order.unit}`, order.requester, order.run, order.school, movementTypeLabel(order.movementType ?? 'PRESTAMO'), order.status,
    ])];
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'historial_movimientos_citt.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><h1 className="text-2xl font-bold">Movimientos y Préstamos</h1><p className="mt-1 text-sm text-slate-500">Control de asignaciones, devoluciones, pedidos y firma digital de compromiso.</p></div>
        <Button variant="outline" onClick={exportMovements}><Download className="mr-1 h-4 w-4" /> Exportar historial</Button>
      </div>

      {role === 'GLOBAL' ? (
        <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm text-sky-800 dark:bg-sky-950/20 dark:text-sky-300">
          El rol Alumno Global solo puede consultar y solicitar activos desde el catálogo de <a href="/pedidos" className="font-bold underline">Pedidos / Catálogo</a>.
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
          <h2 className="font-bold">Registrar Movimiento / Trazabilidad</h2>
          <p className="mt-1 text-xs text-slate-500">Completa los datos y valida la entrega con firma presencial.</p>
          <form onSubmit={prepareSignature} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="block text-sm font-medium">Tipo de operación<select value={movementType} onChange={(event) => setMovementType(event.target.value as MovementType)} className="mt-1 block w-full rounded-lg border bg-background p-2.5 text-sm dark:border-slate-700"><option value="PRESTAMO">Préstamo</option><option value="DEVOLUCION">Devolución</option><option value="PEDIDO">Pedido (Consumible)</option>{role === 'ADMIN' && <option value="BAJA">Baja definitiva</option>}</select></label>
              <label className="block text-sm font-medium">Escuela solicitante<select required value={school} onChange={(event) => setSchool(event.target.value)} className="mt-1 block w-full rounded-lg border bg-background p-2.5 text-sm dark:border-slate-700"><option value="">Selecciona escuela...</option>{schools.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="block text-sm font-medium">Activo o insumo<select required value={selectedAsset?.code ?? ''} onChange={(event) => setAssetCode(event.target.value)} className="mt-1 block w-full rounded-lg border bg-background p-2.5 text-sm dark:border-slate-700">{eligibleAssets.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.name} ({item.available} {item.unitType === 'KG' ? 'kg' : 'unid.'})</option>)}</select></label>
              <label className="block text-sm font-medium">Nombre del solicitante<Input required value={requester} onChange={(event) => setRequester(event.target.value)} placeholder="Nombre completo" /></label>
              <label className="block text-sm font-medium">RUN del solicitante<Input value={run} onChange={(event) => setRun(event.target.value)} placeholder="20.123.456-K" pattern="\d{1,2}\.\d{3}\.\d{3}-[\dkK]" /></label>
              <label className="block text-sm font-medium">Cantidad ({selectedAsset?.unitType === 'KG' ? 'gramos' : 'unidades'})<Input required type="number" min={selectedAsset?.unitType === 'KG' ? 1 : 1} step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />{selectedAsset?.unitType === 'KG' && <span className="mt-1 flex items-center gap-1 text-xs text-sky-600"><Scale className="h-3.5 w-3.5" />Se descontarán {(Number(quantity || 0) / 1000).toFixed(3)} kg del stock.</span>}</label>
              {movementType === 'PRESTAMO' && <label className="block text-sm font-medium">Fecha límite / retorno<Input required type="date" min={new Date().toISOString().slice(0, 10)} value={returnDate} onChange={(event) => setReturnDate(event.target.value)} /></label>}
              <label className="block text-sm font-medium md:col-span-2">Motivo / Taller o asignatura<textarea required minLength={3} maxLength={300} rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 block w-full rounded-lg border bg-background p-2.5 text-sm dark:border-slate-700" /></label>
            </div>
            {data.members.some((member) => member.run.toLowerCase() === run.trim().toLowerCase() && member.blocked) && <p className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700"><ShieldAlert className="h-4 w-4" /> Este solicitante tiene la cuenta bloqueada por morosidad.</p>}
            <Button type="submit" className="w-full"><PenTool className="mr-1 h-4 w-4" /> Siguiente: Firma Presencial</Button>
          </form>
        </section>
      )}

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
        <div><h2 className="font-bold">Historial de Movimientos</h2><p className="mt-1 text-xs text-slate-500">Pedidos, entregas y devoluciones registrados en este navegador.</p></div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3"><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar folio, RUN, solicitante o activo..." /><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm dark:border-slate-700">{['Todos', 'Préstamo', 'Devolución', 'Pedido', 'Baja'].map((item) => <option key={item}>{item}</option>)}</select><Input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} aria-label="Filtrar por fecha" /></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="border-b bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900/60"><tr>{['Folio / Fecha', 'Activo', 'Cantidad', 'Solicitante', 'Tipo', 'Retorno', 'Estado'].map((label) => <th key={label} className="p-3">{label}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {visibleOrders.map((order) => <tr key={order.id}>
                <td className="p-3"><strong className="font-mono text-sky-600">{order.id}</strong><span className="block text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleString('es-CL')}</span></td><td className="p-3 font-semibold">{order.assetName}</td><td className="p-3">{order.quantity} {order.unit}</td><td className="p-3">{order.requester}<span className="block text-[10px] text-slate-400">{order.run} · {order.school}</span></td><td className="p-3"><Badge variant="outline">{movementTypeLabel(order.movementType ?? 'PRESTAMO')}</Badge></td><td className="p-3">{order.returnDate || 'No aplica'}</td><td className="p-3">{order.status}</td>
              </tr>)}
            </tbody>
          </table>
          {!visibleOrders.length && <p className="py-8 text-center text-sm text-slate-500">Todavía no hay movimientos para este filtro.</p>}
        </div>
      </section>

      <Dialog open={signatureOpen} onOpenChange={setSignatureOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Firma Digital de Compromiso</DialogTitle><DialogDescription>Firma en el recuadro antes de confirmar la entrega.</DialogDescription></DialogHeader>
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900">
            <canvas
              ref={canvasRef}
              width={640}
              height={220}
              aria-label="Área para firma"
              className="h-48 w-full touch-none cursor-crosshair rounded-lg bg-white dark:bg-slate-800"
              onPointerDown={(event) => {
                const canvas = canvasRef.current;
                const context = canvas?.getContext('2d');
                if (!canvas || !context) return;
                const rect = canvas.getBoundingClientRect();
                context.beginPath();
                context.moveTo((event.clientX - rect.left) * canvas.width / rect.width, (event.clientY - rect.top) * canvas.height / rect.height);
                canvas.setPointerCapture(event.pointerId);
                drawing.current = true;
              }}
              onPointerMove={(event) => {
                if (!drawing.current) return;
                const canvas = canvasRef.current;
                const context = canvas?.getContext('2d');
                if (!canvas || !context) return;
                const rect = canvas.getBoundingClientRect();
                context.lineTo((event.clientX - rect.left) * canvas.width / rect.width, (event.clientY - rect.top) * canvas.height / rect.height);
                context.stroke();
                hasSignature.current = true;
              }}
              onPointerUp={() => { drawing.current = false; }}
              onPointerCancel={() => { drawing.current = false; }}
            />
          </div>
          <div className="flex justify-between gap-2"><Button variant="outline" onClick={() => { const canvas = canvasRef.current; const context = canvas?.getContext('2d'); if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height); hasSignature.current = false; }}>Limpiar firma</Button><div className="flex gap-2"><Button variant="outline" onClick={() => setSignatureOpen(false)}>Cancelar</Button><Button onClick={saveMovement}>Confirmar y guardar</Button></div></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function movementTypeLabel(type: MovementType) {
  return { PRESTAMO: 'Préstamo', DEVOLUCION: 'Devolución', PEDIDO: 'Pedido', BAJA: 'Baja' }[type];
}
