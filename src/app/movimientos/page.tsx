'use client';

import React, { useState, useRef } from 'react';
import { mockItems, mockUsers } from '@/lib/mockData';
import { Item, ItemStatus, MovementType, SchoolType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  ShieldAlert,
  ShieldCheck,
  Scale,
  Download,
} from 'lucide-react';

const SCHOOLS: SchoolType[] = [
  'Construcción',
  'Mecánica',
  'Administración',
  'Informática',
  'Salud',
  'Turismo',
  'Naturaleza',
];

const ITEM_STATUS_LABELS: Record<string, ItemStatus> = {
  OPERATIVE: 'Operativo',
  EN_MANTENCION: 'En Mantención',
  EN_REPARACION: 'En Reparación',
  DE_BAJA: 'De Baja',
  DESAPARECIDO: 'Desaparecido',
};

interface MovementRow {
  folio: string;
  date: string;
  type: MovementType;
  item: string;
  qty: string;
  responsible: string;
}

export default function MovimientosPage() {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const currentUser = mockUsers.data[currentUserIndex] ?? mockUsers.data[0];
  const items: Item[] = mockItems.data.map((item) => {
    const status = ITEM_STATUS_LABELS[item.status];
    if (!status) {
      throw new Error(`Estado de activo no reconocido: ${item.status}`);
    }

    return {
      id: item.id,
      name: item.name,
      category_id: item.category.id,
      location_id: item.location.id,
      status,
      stock: 1,
      unit: 'uds',
      is_consumable: false,
      qr_code: item.code,
    };
  });

  const [movementType, setMovementType] = useState<MovementType>('PRESTAMO');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [applicantSchool, setApplicantSchool] = useState<SchoolType | ''>('');
  const [returnDate, setReturnDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [responsibleName, setResponsibleName] = useState('');

  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const nextFolioNumber = useRef(89);

  const [movementsHistory, setMovementsHistory] = useState<MovementRow[]>([
    {
      folio: 'MOV-2026-089',
      date: 'Hoy, 10:15 AM',
      type: 'PRESTAMO',
      item: 'Arduino Mega 2560 #04',
      qty: '1 Unid.',
      responsible: 'Matías Torres (Alumno)',
    },
    {
      folio: 'MOV-2026-088',
      date: 'Hoy, 09:30 AM',
      type: 'DEVOLUCION',
      item: 'Cautín Weller 60W',
      qty: '1 Unid.',
      responsible: 'Camila Vega (Docente)',
    },
  ]);

  const selectedItem = items.find((i) => i.id === selectedItemId);
  const isFilament =
    selectedItem?.is_consumable ||
    selectedItem?.name.toLowerCase().includes('filamento') ||
    selectedItem?.name.toLowerCase().includes('pla');

  const isGlobalUser = currentUser.role === 'USUARIO_GLOBAL';
  const isBlocked = currentUser.is_blocked;

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0284c7';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleOpenSignature = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) {
      toast.error('Cuenta bloqueada por morosidad');
      return;
    }
    if (movementType === 'PRESTAMO' && !returnDate) {
      toast.error('Debes ingresar la fecha límite de retorno');
      return;
    }
    setSignatureModalOpen(true);
  };

  const handleConfirmMovement = () => {
    const newMovement: MovementRow = {
      folio: `MOV-2026-${String(++nextFolioNumber.current).padStart(3, '0')}`,
      date: 'Ahora mismo',
      type: movementType,
      item: selectedItem?.name || 'Activo CITT',
      qty: isFilament ? `${quantity} g (${(quantity / 1000).toFixed(3)} kg)` : `${quantity} Unid.`,
      responsible: `${responsibleName} (${applicantSchool})`,
    };

    setMovementsHistory([newMovement, ...movementsHistory]);
    setSignatureModalOpen(false);
    toast.success('Movimiento y firma registrados exitosamente');
    clearCanvas();
  };

  return (
    <div className="space-y-6">
      <div className="p-3.5 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-slate-500">
          Probar comportamiento de permisos: <strong className="text-slate-800 dark:text-white">({currentUser.role})</strong>
        </span>
        <div className="flex gap-2">
          {mockUsers.data.map((user, idx) => (
            <button
              key={user.id}
              onClick={() => setCurrentUserIndex(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                currentUserIndex === idx
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {user.name.split(' ')[0]} ({user.role})
            </button>
          ))}
        </div>
      </div>

      {isBlocked && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-700">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span><strong>Usuario Bloqueado:</strong> Registras morosidad en préstamos previos. Acciones deshabilitadas.</span>
        </div>
      )}

      <Card className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-bold text-slate-800 dark:text-white">
            Registrar Movimiento en Trazabilidad
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Completa los datos del movimiento y valida con la firma presencial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOpenSignature} className="space-y-4">
            <fieldset disabled={isBlocked} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tipo de Operación</label>
                  <Select value={movementType} onValueChange={(v) => setMovementType(v as MovementType)}>
                    <SelectTrigger className="h-9 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESTAMO">Préstamo (Asignación temporal)</SelectItem>
                      <SelectItem value="DEVOLUCION">Devolución (Entrada a pañol)</SelectItem>
                      <SelectItem value="PEDIDO">Pedido (Consumible definitivo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Escuela Solicitante *</label>
                  <Select value={applicantSchool} onValueChange={(v) => setApplicantSchool(v as SchoolType)} required>
                    <SelectTrigger className="h-9 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <SelectValue placeholder="Seleccione Escuela..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHOOLS.map((school) => (
                        <SelectItem key={school} value={school}>
                          Escuela de {school}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Activo o Insumo *</label>
                  <Select value={selectedItemId} onValueChange={setSelectedItemId} required>
                    <SelectTrigger className="h-9 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <SelectValue placeholder="Seleccionar ítem..." />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.stock} {item.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nombre del Solicitante *</label>
                  <Input
                    placeholder="Nombre completo del alumno/docente..."
                    value={responsibleName}
                    onChange={(e) => setResponsibleName(e.target.value)}
                    className="h-9 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Cantidad {isFilament && '(en gramos)'}
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="h-9 text-xs pr-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                      required
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                      {isFilament ? 'g' : 'uds'}
                    </span>
                  </div>
                  {isFilament && (
                    <p className="text-[11px] text-sky-600 flex items-center gap-1 mt-1 font-medium">
                      <Scale className="w-3.5 h-3.5" />
                      Se descontarán {(quantity / 1000).toFixed(3)} kg del stock general.
                    </p>
                  )}
                </div>

                {movementType !== 'PEDIDO' ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Fecha Límite / Retorno *</label>
                    <Input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      required={movementType === 'PRESTAMO'}
                      className="h-9 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs text-slate-500 self-center">
                    Los consumibles son definitivos y no requieren fecha de retorno.
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>
                    Validado por: <strong>Paz Constanza Morales Saavedra</strong> / Alumno Líder
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] bg-white">Ventanilla CITT</Badge>
              </div>

              {isGlobalUser ? (
                <div>
                  <Button disabled className="w-full h-9 text-xs bg-slate-200 text-slate-500 cursor-not-allowed">
                    Confirmar Préstamo (Bloqueado para Alumno Global)
                  </Button>
                  <p className="text-[10px] text-slate-400 text-center mt-1">
                    Requiere validación física en ventanilla con Alumno Líder.
                  </p>
                </div>
              ) : (
                <Button type="submit" className="w-full h-9 text-xs bg-sky-600 hover:bg-sky-700 text-white font-semibold">
                  Siguiente: Firma Presencial de Entrega
                </Button>
              )}
            </fieldset>
          </form>
        </CardContent>
      </Card>

      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Historial Inalterable de Movimientos</h3>
          <Button variant="ghost" size="sm" className="text-xs h-7">
            <Download className="w-3.5 h-3.5 mr-1" /> Exportar
          </Button>
        </div>
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
            <tr>
              <th className="p-3.5">Folio / Fecha</th>
              <th className="p-3.5">Tipo</th>
              <th className="p-3.5">Activo / Equipo</th>
              <th className="p-3.5">Cantidad</th>
              <th className="p-3.5">Responsable</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {movementsHistory.map((row) => (
              <tr key={row.folio}>
                <td className="p-3.5">
                  <p className="font-mono text-sky-600 font-semibold">{row.folio}</p>
                  <p className="text-[10px] text-slate-400">{row.date}</p>
                </td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-600 border border-sky-100">
                    {row.type}
                  </span>
                </td>
                <td className="p-3.5 font-medium dark:text-white">{row.item}</td>
                <td className="p-3.5 font-bold">{row.qty}</td>
                <td className="p-3.5 text-slate-600 dark:text-slate-300">{row.responsible}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={signatureModalOpen} onOpenChange={setSignatureModalOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200 rounded-2xl p-5 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xs font-bold text-slate-800">
              Firma Digital de Compromiso
            </DialogTitle>
            <DialogDescription className="text-[11px] text-slate-500">
              Firme en el recuadro para respaldar y registrar oficialmente la transacción.
            </DialogDescription>
          </DialogHeader>

          <div className="border border-slate-300 rounded-xl bg-slate-50 h-36 relative overflow-hidden">
            <canvas
              ref={canvasRef}
              width={400}
              height={144}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="w-full h-full cursor-crosshair"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={clearCanvas} className="w-1/2 text-xs">
              Limpiar
            </Button>
            <Button size="sm" onClick={handleConfirmMovement} className="w-1/2 text-xs bg-sky-600 hover:bg-sky-700 text-white">
              Guardar y Registrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}