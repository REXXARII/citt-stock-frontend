'use client';

import React, { useState } from 'react';
import { mockItems, mockUsers } from '@/lib/mockData';
import { Item, MovementType, SchoolType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { toast } from 'sonner';
import {
  ShieldAlert,
  ShieldCheck,
  Calendar as CalendarIcon,
  Scale,
  Send,
  AlertCircle,
  Building,
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

export default function MovimientosPage() {
  // Simulador de usuario activo para probar perfiles
  const [currentUserIndex, setCurrentUserIndex] = useState<number>(0);
  const currentUser = mockUsers.data[currentUserIndex] || mockUsers.data[0];
  const items: Item[] = mockItems.data.map((item) => ({
    id: item.id,
    name: item.name,
    category_id: item.category.id,
    location_id: item.location.id,
    status: 'Operativo',
    stock: 1,
    unit: 'uds',
    is_consumable: false,
    qr_code: item.code,
  }));

  // Estado del Formulario
  const [movementType, setMovementType] = useState<MovementType>('PRESTAMO');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [applicantSchool, setApplicantSchool] = useState<SchoolType | ''>('');
  const [returnDate, setReturnDate] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  const selectedItem = items.find((i) => i.id === selectedItemId);

  // Detección de consumible (Filamento 3D / PLA / Resina)
  const isFilament =
    selectedItem?.is_consumable ||
    selectedItem?.name.toLowerCase().includes('filamento') ||
    selectedItem?.name.toLowerCase().includes('pla');

  // Cálculos y validaciones de permisos
  const isGlobalUser = currentUser.role === 'USUARIO_GLOBAL';
  const isBlocked = currentUser.is_blocked;
  const canDirectConfirm = currentUser.role === 'ADMINISTRADOR' || currentUser.role === 'ALUMNO_LIDER';

  // Manejo de envío
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isBlocked) {
      toast.error('Cuenta bloqueada por morosidad', {
        description: 'Debes regularizar tus préstamos pendientes antes de realizar una nueva solicitud.',
      });
      return;
    }

    if (isGlobalUser) {
      toast.info('Solicitud enviada a cola de espera', {
        description: 'Acércate al mesón del CITT para validación presencial de carnet con el Alumno Líder.',
      });
      return;
    }

    if (movementType === 'PRESTAMO' && !returnDate) {
      toast.error('Campo requerido', {
        description: 'Debes ingresar una fecha estimada de retorno.',
      });
      return;
    }

    const payload = {
      type: movementType,
      itemId: selectedItemId,
      school: applicantSchool,
      returnDate: movementType === 'PEDIDO' ? null : returnDate,
      quantity: isFilament ? quantity / 1000 : quantity, // Conversión matemática a kg si es filamento
      approvedBy: 'Paz Constanza Morales Saavedra',
    };

    toast.success('Operación registrada exitosamente', {
      description: `Tipo: ${payload.type} | Cantidad efectiva: ${payload.quantity} ${isFilament ? 'kg' : selectedItem?.unit || 'uds'}`,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Switcher para pruebas de roles */}
      <div className="mb-6 p-4 bg-slate-100 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-600">
          <span className="font-semibold text-slate-800">Simulador de Rol:</span> Cambia de cuenta para probar las validaciones de UI.
        </div>
        <div className="flex gap-2">
          {mockUsers.data.map((user, idx) => (
            <button
              key={user.id}
              onClick={() => setCurrentUserIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentUserIndex === idx
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              {user.name.split(' ')[0]} ({user.role})
            </button>
          ))}
        </div>
      </div>

      {/* Alerta de bloqueo por morosidad */}
      {isBlocked && (
        <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-rose-800">Usuario Bloqueado por Morosidad</h4>
            <p className="text-xs text-rose-600 mt-0.5">
              Esta cuenta registra devoluciones pendientes vencidas. Toda interacción en el sistema se encuentra temporalmente deshabilitada.
            </p>
          </div>
        </div>
      )}

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-100 pb-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-900">
              Registrar Movimiento de Inventario
            </CardTitle>
            <Badge
              variant="outline"
              className={
                isBlocked
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }
            >
              {currentUser.role}
            </Badge>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Formulario dinámico para préstamos de equipos, devoluciones y pedidos de consumibles.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset disabled={isBlocked} className="space-y-6">
              {/* Selector de Tipo de Operación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Tipo de Operación
                  </label>
                  <Select
                    value={movementType}
                    onValueChange={(val) => setMovementType(val as MovementType)}
                  >
                    <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Seleccionar operación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESTAMO">PRÉSTAMO (Equipo temporal)</SelectItem>
                      <SelectItem value="DEVOLUCION">DEVOLUCIÓN (Retorno a casillero)</SelectItem>
                      <SelectItem value="PEDIDO">PEDIDO (Consumible definitivo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Selección de Escuela Solicitante */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" /> Escuela del Solicitante *
                  </label>
                  <Select
                    value={applicantSchool}
                    onValueChange={(val) => setApplicantSchool(val as SchoolType)}
                    required
                  >
                    <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Seleccione Escuela Duoc UC" />
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

              {/* Selección del Ítem */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Activo o Consumible Requerido *
                </label>
                <Select value={selectedItemId} onValueChange={setSelectedItemId} required>
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Seleccionar activo del catálogo" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.stock} {item.unit} disp.)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cantidad y Lógica de Gramos para Filamento 3D */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Cantidad Solicitada {isFilament && '(en gramos)'}
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="pr-12 bg-slate-50 border-slate-200"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xs font-semibold text-slate-400">
                      {isFilament ? 'g' : selectedItem?.unit || 'uds'}
                    </div>
                  </div>

                  {isFilament && (
                    <div className="p-3 bg-sky-50 rounded-lg border border-sky-100 flex items-start gap-2 text-xs text-sky-800">
                      <Scale className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Conversión Automática:</span> El sistema
                        descontará matemáticamente{' '}
                        <span className="font-bold">{(quantity / 1000).toFixed(3)} kg</span> del
                        stock general en base de datos.
                      </div>
                    </div>
                  )}
                </div>

                {/* Fecha de Retorno: Obligatoria en PRESTAMO, Oculta en PEDIDO */}
                {movementType !== 'PEDIDO' ? (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" /> Fecha Límite /
                      Retorno *
                    </label>
                    <Input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      required={movementType === 'PRESTAMO'}
                      className="bg-slate-50 border-slate-200"
                    />
                    <span className="text-[11px] text-slate-400">
                      Préstamos estándar tienen un máximo de 72 horas hábiles.
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 text-xs text-slate-500 self-center">
                    <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Los pedidos de consumibles son de entrega definitiva sin obligación de retorno.
                    </span>
                  </div>
                )}
              </div>

              {/* Indicador de Aprobación */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>
                    Aprobación presencial requerida por:{' '}
                    <strong className="text-slate-900 font-medium">
                      Paz Constanza Morales Saavedra (Administrador)
                    </strong>{' '}
                    o Alumno Líder de turno.
                  </span>
                </div>
                <Badge variant="outline" className="bg-white text-slate-600 text-[10px]">
                  Ventanilla CITT
                </Badge>
              </div>

              {/* Botones de Envío según Roles */}
              <div className="pt-2">
                {isGlobalUser ? (
                  <div className="space-y-2">
                    <Button
                      type="submit"
                      disabled
                      className="w-full bg-slate-200 text-slate-500 cursor-not-allowed font-medium"
                    >
                      Confirmar Préstamo Directo (Bloqueado)
                    </Button>
                    <p className="text-[11px] text-center text-slate-500">
                      Como Usuario Global, debes validar este préstamo presencialmente en ventanilla con el Alumno Líder.
                    </p>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    {canDirectConfirm ? 'Aprobar y Registrar Movimiento' : 'Enviar Solicitud'}
                  </Button>
                )}
              </div>
            </fieldset>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}