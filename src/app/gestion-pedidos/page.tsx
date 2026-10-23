'use client';

import { useMemo, useState } from 'react';
import { Check, PackageCheck, Search, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAppState, type OrderRecord, type OrderStatus } from '@/components/app-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const statusStyle: Record<OrderStatus, string> = {
  Solicitado: 'bg-amber-50 text-amber-700 border-amber-200',
  Aceptado: 'bg-sky-50 text-sky-700 border-sky-200',
  Preparado: 'bg-violet-50 text-violet-700 border-violet-200',
  Enviado: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Recibido: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rechazado: 'bg-rose-50 text-rose-700 border-rose-200',
};

const nextStep: Partial<Record<OrderStatus, { label: string; status: OrderStatus; icon: typeof Check }>> = {
  Solicitado: { label: 'Aceptar', status: 'Aceptado', icon: Check },
  Aceptado: { label: 'Preparar', status: 'Preparado', icon: PackageCheck },
  Preparado: { label: 'Enviar pedido', status: 'Enviado', icon: Send },
  Enviado: { label: 'Recepcionar', status: 'Recibido', icon: Check },
};

export default function GestionPedidosPage() {
  const { role, currentUser, data, setData } = useAppState();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [observation, setObservation] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => data.orders.filter((order) => {
    const searchMatches = `${order.id} ${order.assetName} ${order.requester} ${order.run}`.toLowerCase().includes(query.toLowerCase());
    return searchMatches && (statusFilter === 'Todos' || order.status === statusFilter);
  }), [data.orders, query, statusFilter]);

  const updateOrder = (id: string, status: OrderStatus, note = '') => {
    if (role === 'GLOBAL') {
      toast.error('Este rol no tiene permiso para gestionar pedidos.');
      return;
    }
    const order = data.orders.find((item) => item.id === id);
    if (!order) {
      toast.error('No se encontró el pedido seleccionado.');
      return;
    }
    if (status === 'Recibido' && !order.stockDeducted) {
      const asset = data.assets.find((item) => item.code === order.assetCode);
      if (!asset) {
        toast.error('No se encontró el activo asociado al pedido.');
        return;
      }
      const amount = asset.unitType === 'KG' ? order.quantity / 1000 : order.quantity;
      if (amount > asset.available) {
        toast.error('Stock insuficiente para completar la entrega.');
        return;
      }
    }

    const now = new Date().toISOString();
    const actor = currentUser.name;
    setData((current) => ({
      ...current,
      assets: status === 'Recibido' && !order.stockDeducted
        ? current.assets.map((asset) => asset.code === order.assetCode
          ? { ...asset, available: Number(Math.max(0, asset.available - (asset.unitType === 'KG' ? order.quantity / 1000 : order.quantity)).toFixed(3)) }
          : asset)
        : current.assets,
      orders: current.orders.map((item) => item.id === id ? {
        ...item,
        status,
        stockDeducted: status === 'Recibido' ? true : item.stockDeducted,
        history: [...item.history, {
          action: status === 'Rechazado' ? 'Solicitud rechazada' : `Pedido ${status.toLowerCase()}`,
          actor,
          date: now,
          ...(note.trim() ? { observation: note.trim() } : {}),
        }],
      } : item),
    }));
    setRejectingId(null);
    setObservation('');
    toast.success(status === 'Recibido' ? 'Pedido recepcionado y stock actualizado.' : `Pedido actualizado: ${status}.`);
  };

  const counts = {
    pending: data.orders.filter((order) => order.status === 'Solicitado').length,
    preparing: data.orders.filter((order) => ['Aceptado', 'Preparado'].includes(order.status)).length,
    sent: data.orders.filter((order) => order.status === 'Enviado').length,
    rejected: data.orders.filter((order) => order.status === 'Rechazado').length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
        <p className="mt-1 text-sm text-slate-500">Revisa, aprueba, prepara y despacha pedidos manteniendo el folio y la trazabilidad.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Pedidos pendientes', value: counts.pending, color: 'text-amber-600' },
          { label: 'En preparación', value: counts.preparing, color: 'text-cyan-600' },
          { label: 'Por recepcionar', value: counts.sent, color: 'text-violet-600' },
          { label: 'Rechazados', value: counts.rejected, color: 'text-rose-600' },
        ].map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
            <p className="text-xs text-slate-500">{metric.label}</p><strong className={`mt-1 block text-2xl ${metric.color}`}>{metric.value}</strong>
          </div>
        ))}
      </div>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por pedido, RUN, solicitante o activo..." className="pl-9" />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm dark:border-slate-700">
            {['Todos', 'Solicitado', 'Aceptado', 'Preparado', 'Enviado', 'Recibido', 'Rechazado'].map((status) => <option key={status}>{status}</option>)}
          </select>
        </div>

        {!filteredOrders.length ? (
          <p className="py-10 text-center text-sm text-slate-500">No hay pedidos para mostrar con estos filtros.</p>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order: OrderRecord) => {
              const step = nextStep[order.status];
              const Icon = step?.icon;
              return (
                <article key={order.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-600">{order.id}</span>
                        <Badge variant="outline" className={statusStyle[order.status]}>{order.status}</Badge>
                      </div>
                      <h2 className="mt-2 font-bold">{order.assetName}</h2>
                      <p className="mt-1 text-xs text-slate-500">{order.quantity} {order.unit} · {order.requester} ({order.run}) · {order.school}</p>
                      <p className="mt-1 text-xs text-slate-500">Motivo: {order.notes}{order.returnDate ? ` · Retorno: ${order.returnDate}` : ' · Consumible / sin retorno'}</p>
                    </div>
                    {role === 'ADMIN' || role === 'AYUDANTE' ? (
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {step && (
                          <Button size="sm" onClick={() => updateOrder(order.id, step.status)}>
                            {Icon && <Icon className="mr-1 h-3.5 w-3.5" />}{step.label}
                          </Button>
                        )}
                        {order.status === 'Solicitado' && (
                          <Button size="sm" variant="destructive" onClick={() => setRejectingId(order.id)}>
                            <X className="mr-1 h-3.5 w-3.5" /> Rechazar
                          </Button>
                        )}
                      </div>
                    ) : null}
                  </div>
                  {rejectingId === order.id && (
                    <div className="mt-4 space-y-2 rounded-lg bg-rose-50 p-3 dark:bg-rose-950/20">
                      <label className="block text-xs font-semibold" htmlFor={`reject-${order.id}`}>Motivo del rechazo</label>
                      <Input id={`reject-${order.id}`} value={observation} onChange={(event) => setObservation(event.target.value)} placeholder="Explica por qué se rechaza..." />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setRejectingId(null); setObservation(''); }}>Cancelar</Button>
                        <Button size="sm" variant="destructive" disabled={observation.trim().length < 3} onClick={() => updateOrder(order.id, 'Rechazado', observation)}>Confirmar rechazo</Button>
                      </div>
                    </div>
                  )}
                  <details className="mt-3 border-t pt-3 text-xs dark:border-slate-700">
                    <summary className="cursor-pointer font-semibold text-slate-600 dark:text-slate-300">Ver trazabilidad ({order.history.length} eventos)</summary>
                    <ol className="mt-2 space-y-2">
                      {order.history.map((event, index) => (
                        <li key={`${event.date}-${index}`} className="border-l-2 border-sky-200 pl-3 text-slate-500">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{event.action}</span> · {event.actor} · {new Date(event.date).toLocaleString('es-CL')}
                          {event.observation && <p className="mt-1">Observación: {event.observation}</p>}
                        </li>
                      ))}
                    </ol>
                  </details>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
