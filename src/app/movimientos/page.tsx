'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarClock, CheckCircle2, Download, FileText, PenTool, PlusCircle, Scale, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useAppState, type MovementType, type OrderRecord } from '@/components/app-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ViewToolbar } from '@/components/view-toolbar';

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
  const [registerOpen, setRegisterOpen] = useState(false);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<OrderRecord | null>(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos los Tipos');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [view, setView] = useState<'list' | 'grid'>('list');
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
    const movementName = movementTypeLabel(order.movementType ?? 'PRESTAMO');
    const queryMatches = `${order.id} ${order.assetCode} ${order.assetName} ${order.requester} ${order.run} ${order.school}`.toLowerCase().includes(query.toLowerCase());
    const typeMatches = typeFilter === 'Todos los Tipos' || typeFilter === 'Todos' || typeFilter === movementName;
    const dateMatches = !dateFilter || order.createdAt.slice(0, 10) === dateFilter;
    const statusMatches = statusFilter === 'Todos' || order.status === statusFilter;
    return queryMatches && typeMatches && dateMatches && statusMatches;
  }), [data.orders, dateFilter, query, statusFilter, typeFilter]);
  const today = dateKey(new Date());
  const movementsToday = data.orders.filter((order) =>
    dateKey(new Date(order.createdAt)) === today,
  ).length;
  const loanedByAsset = data.orders.reduce<Record<string, number>>((totals, order) => {
    if (order.status !== 'Recibido') return totals;
    if (order.movementType === 'PRESTAMO') totals[order.assetCode] = (totals[order.assetCode] ?? 0) + order.quantity;
    if (order.movementType === 'DEVOLUCION') totals[order.assetCode] = (totals[order.assetCode] ?? 0) - order.quantity;
    return totals;
  }, {});
  const loanedAssets = Object.values(loanedByAsset).filter((quantity) => quantity > 0).length;
  const pendingReturns = data.orders.filter((order) =>
    order.movementType === 'PRESTAMO' &&
    order.status === 'Recibido' &&
    order.returnDate &&
    order.returnDate < today &&
    (loanedByAsset[order.assetCode] ?? 0) > 0,
  ).length;
  const retiredMovements = data.orders.filter((order) => order.movementType === 'BAJA').length;

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
    setRegisterOpen(false);
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
    const signatureData = canvas.toDataURL('image/png');
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
      signatureData,
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
    setRegisterOpen(false);
    setRequester('');
    setRun('');
    setNotes('');
    setReturnDate('');
    setQuantity('1');
    toast.success(`Movimiento ${id} registrado y stock actualizado.`);
  };

  const exportMovements = () => {
    const rows = [['Folio', 'Fecha', 'Código', 'Activo', 'Cantidad', 'Solicitante', 'RUN', 'Escuela', 'Tipo', 'Retorno', 'Estado', 'Firma'], ...visibleOrders.map((order) => [
      order.id, order.createdAt, order.assetCode, order.assetName, `${order.quantity} ${order.unit}`, order.requester, order.run, order.school, movementTypeLabel(order.movementType ?? 'PRESTAMO'), order.returnDate, order.status, order.signatureData ? 'Validada' : 'Pendiente',
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
        <div><h1 className="text-2xl font-bold">Movimientos y Préstamos</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Control de asignaciones, devoluciones, pedidos y firma digital de compromiso.</p></div>
        <div className="grid shrink-0 grid-cols-2 items-center gap-2.5">
          <Button size="sm" variant="outline" onClick={exportMovements}><Download className="mr-1 h-4 w-4" /> Exportar Log</Button>
          {role !== 'GLOBAL' && <Button size="sm" onClick={() => setRegisterOpen(true)}><PlusCircle className="mr-1 h-4 w-4" /> Registrar Movimiento</Button>}
        </div>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Movimientos Hoy', value: movementsToday, color: 'text-slate-900 dark:text-white' },
          { label: 'Activos Prestados', value: loanedAssets.toLocaleString('es-CL', { maximumFractionDigits: 3 }), color: 'text-sky-500' },
          { label: 'Devoluciones Pendientes', value: pendingReturns, color: 'text-amber-500' },
          { label: 'Bajas / Retiros', value: retiredMovements, color: 'text-rose-500' },
        ].map((stat) => (
          <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800/90 dark:bg-[#111827]">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className={`mt-1 text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/90 dark:bg-[#111827]">
        <ViewToolbar
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder="Buscar por RUN, alumno, equipo o ID transacción..."
          date={dateFilter}
          onDateChange={setDateFilter}
          filter={typeFilter}
          filterOptions={['Todos los Tipos', 'Préstamo', 'Devolución', 'Pedido', 'Baja'].map((item) => ({ value: item, label: item }))}
          onFilterChange={setTypeFilter}
          pills={['Todos', 'Solicitado', 'Aceptado', 'Preparado', 'Enviado', 'Recibido', 'Rechazado'].map((item) => ({ value: item, label: item }))}
          activePill={statusFilter}
          onPillChange={setStatusFilter}
          view={view}
          onViewChange={setView}
        />
        {view === 'list' ? <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-400 dark:border-slate-800">
              <tr>{['Folio / Fecha', 'Activo seleccionado', 'Cantidad', 'Responsable / Solicitante', 'Tipo de movimiento', 'Fecha límite / Retorno', 'Firma / Recibo'].map((label) => <th key={label} className="px-2 py-3 font-semibold uppercase">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70">
              {visibleOrders.map((order) => {
                const movementLabel = movementTypeLabel(order.movementType ?? 'PRESTAMO');
                const movementColor = order.movementType === 'BAJA'
                  ? 'bg-rose-500/15 text-rose-500'
                  : order.movementType === 'PEDIDO' || order.movementType === 'DEVOLUCION'
                    ? 'bg-sky-500/15 text-sky-500'
                    : 'bg-amber-500/15 text-amber-500';
                return (
                  <tr key={order.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="px-2 py-3.5">
                      <p className="font-mono font-bold text-sky-600">#{order.id}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{new Date(order.createdAt).toLocaleString('es-CL')}</p>
                    </td>
                    <td className="px-2 py-3.5">
                      <p className="font-semibold">{order.assetName}</p>
                      <p className="mt-1 font-mono text-[10px] text-slate-400">{order.assetCode}</p>
                    </td>
                    <td className="px-2 py-3.5 font-bold">
                      {order.quantity} {order.unit}
                      {order.unit === 'g' && <span className="block text-[10px] font-normal text-slate-400">(-{(order.quantity / 1000).toFixed(3)} kg)</span>}
                    </td>
                    <td className="px-2 py-3.5">
                      <p className="font-medium">{order.requester} ({order.run || 'RUN no registrado'})</p>
                      <p className="mt-1 text-[11px] text-slate-400">{order.ownerRole === 'ADMIN' ? 'Administrador' : order.ownerRole === 'AYUDANTE' ? 'Alumno Ayudante' : 'Usuario Global'} · Esc. {order.school}</p>
                    </td>
                    <td className="px-2 py-3.5"><Badge variant="outline" className={`rounded-full border-0 px-2.5 ${movementColor}`}>{movementLabel}</Badge></td>
                    <td className="px-2 py-3.5 text-slate-500">
                      {order.movementType === 'BAJA' ? 'Retiro definitivo' : order.returnDate ? new Date(`${order.returnDate}T00:00:00`).toLocaleDateString('es-CL') : 'No aplica (Consumible)'}
                    </td>
                    <td className="px-2 py-3.5 text-right">
                      {order.signatureData ? (
                        <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => setReceiptOrder(order)}><CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Ver firma</Button>
                      ) : order.movementType === 'BAJA' ? (
                        <span className="font-semibold text-rose-400">Acta de Baja</span>
                      ) : (
                        <span className="text-slate-400">Sin firma</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div> : <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleOrders.map((order) => (
            <article key={order.id} className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="flex items-start justify-between gap-2"><div><p className="font-mono text-xs font-bold text-sky-600">#{order.id}</p><p className="mt-1 text-[11px] text-slate-400">{new Date(order.createdAt).toLocaleString('es-CL')}</p></div><Badge variant="outline">{movementTypeLabel(order.movementType ?? 'PRESTAMO')}</Badge></div>
              <div><h3 className="font-bold">{order.assetName}</h3><p className="font-mono text-[11px] text-slate-400">{order.assetCode}</p></div>
              <p className="text-xs text-slate-500">{order.quantity} {order.unit} · {order.requester} ({order.run || 'RUN no registrado'})</p>
              <p className="text-xs text-slate-500">{order.school} · {order.status}</p>
              {order.signatureData
                ? <Button size="sm" variant="outline" onClick={() => setReceiptOrder(order)}><CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Ver firma</Button>
                : <p className="text-xs text-slate-400">{order.movementType === 'BAJA' ? 'Acta de Baja' : 'Sin firma'}</p>}
            </article>
          ))}
        </div>}
        {!visibleOrders.length && <div className="py-10 text-center text-sm text-slate-500"><CalendarClock className="mx-auto mb-2 h-6 w-6" />Todavía no hay movimientos para este filtro.</div>}
      </section>

      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Registrar Movimiento / Trazabilidad</DialogTitle><DialogDescription>Registra la asignación, devolución o retiro del activo y valida con firma digital.</DialogDescription></DialogHeader>
          <form onSubmit={prepareSignature} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="block text-xs font-semibold">Tipo de operación<select value={movementType} onChange={(event) => setMovementType(event.target.value as MovementType)} className="mt-1 block h-11 w-full rounded-xl border bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"><option value="PRESTAMO">Préstamo (Exige Fecha de Retorno)</option><option value="PEDIDO">Pedido / Consumible (Sin Fecha de Retorno)</option><option value="DEVOLUCION">Devolución</option>{role === 'ADMIN' && <option value="BAJA">Baja (Activo sin reparación)</option>}</select></label>
              <label className="block text-xs font-semibold">Activo / Equipo<select required value={selectedAsset?.code ?? ''} onChange={(event) => setAssetCode(event.target.value)} className="mt-1 block h-11 w-full rounded-xl border bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-900">{eligibleAssets.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.name} ({item.available} {item.unitType === 'KG' ? 'kg' : 'unid.'})</option>)}</select></label>
              <label className="block text-xs font-semibold">Cantidad ({selectedAsset?.unitType === 'KG' ? 'gramos' : 'unidades'})<Input required type="number" min={1} step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />{selectedAsset?.unitType === 'KG' && <span className="mt-1 flex items-center gap-1 text-[11px] text-sky-600"><Scale className="h-3.5 w-3.5" />Se descontarán {(Number(quantity || 0) / 1000).toFixed(3)} kg del stock.</span>}</label>
              <label className="block text-xs font-semibold">Escuela solicitante<select required value={school} onChange={(event) => setSchool(event.target.value)} className="mt-1 block h-11 w-full rounded-xl border bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"><option value="">Selecciona escuela...</option>{schools.map((item) => <option key={item}>{item}</option>)}</select></label>
              {movementType === 'PRESTAMO' && <label className="block text-xs font-semibold">Fecha límite de retorno<Input required type="date" min={new Date().toISOString().slice(0, 10)} value={returnDate} onChange={(event) => setReturnDate(event.target.value)} /></label>}
              <label className="block text-xs font-semibold">Responsable / Solicitante<Input required value={requester} onChange={(event) => setRequester(event.target.value)} placeholder="Nombre completo" /></label>
              <label className="block text-xs font-semibold">RUN del solicitante<Input value={run} onChange={(event) => setRun(event.target.value)} placeholder="20.123.456-K" pattern="\d{1,2}\.\d{3}\.\d{3}-[\dkK]" /></label>
              <label className="block text-xs font-semibold md:col-span-2">Observaciones / Motivo<textarea required minLength={3} maxLength={300} rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 block w-full rounded-xl border bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>
            </div>
            {data.members.some((member) => member.run.toLowerCase() === run.trim().toLowerCase() && member.blocked) && <p className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700"><ShieldAlert className="h-4 w-4" /> Este solicitante tiene la cuenta bloqueada por morosidad.</p>}
            <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setRegisterOpen(false)}>Cancelar</Button><Button type="submit"><PenTool className="mr-1 h-4 w-4" /> Siguiente: Firma</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={signatureOpen} onOpenChange={setSignatureOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Firma Digital de Compromiso</DialogTitle><DialogDescription>Firma en el recuadro para respaldar la entrega del activo.</DialogDescription></DialogHeader>
          <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
            <canvas
              ref={canvasRef}
              width={390}
              height={190}
              aria-label="Área para firma"
              className="h-48 w-full touch-none cursor-crosshair bg-white dark:bg-slate-800"
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
          <div className="flex justify-between gap-2"><Button variant="outline" onClick={() => { const canvas = canvasRef.current; const context = canvas?.getContext('2d'); if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height); hasSignature.current = false; }}>Limpiar</Button><div className="flex gap-2"><Button variant="outline" onClick={() => { setSignatureOpen(false); setRegisterOpen(true); }}>Volver</Button><Button onClick={saveMovement}>Guardar Firma</Button></div></div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(receiptOrder)} onOpenChange={(open) => { if (!open) setReceiptOrder(null); }}>
        <DialogContent className="sm:max-w-md">
          {receiptOrder && (
            <>
              <DialogHeader><DialogTitle>Comprobante de Movimiento</DialogTitle><DialogDescription>Firma digital asociada a {receiptOrder.id}.</DialogDescription></DialogHeader>
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3"><div><p className="font-mono font-bold text-sky-600">{receiptOrder.id}</p><p className="mt-1 font-bold">{receiptOrder.assetName}</p></div><Badge variant="outline">{movementTypeLabel(receiptOrder.movementType ?? 'PRESTAMO')}</Badge></div>
                <p className="text-slate-500">{receiptOrder.requester} · {receiptOrder.run}</p>
                <p className="text-slate-500">{new Date(receiptOrder.createdAt).toLocaleString('es-CL')}</p>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700">
                  {receiptOrder.signatureData && <Image src={receiptOrder.signatureData} alt={`Firma de ${receiptOrder.requester}`} width={390} height={128} unoptimized className="h-32 w-full object-contain" />}
                </div>
                <p className="flex items-center gap-1.5 font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Firma guardada y validada</p>
              </div>
              <Button variant="outline" onClick={() => setReceiptOrder(null)}><FileText className="mr-1 h-4 w-4" /> Cerrar comprobante</Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function movementTypeLabel(type: MovementType) {
  return { PRESTAMO: 'Préstamo', DEVOLUCION: 'Devolución', PEDIDO: 'Pedido', BAJA: 'Baja' }[type];
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
