'use client';

import { useMemo, useState } from 'react';
import { Plus, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { useAppState, type WorkOrder } from '@/components/app-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const statusList: WorkOrder['status'][] = ['Diagnóstico', 'En Proceso', 'Esperando Repuesto', 'Finalizada'];

export default function MantenimientoPage() {
  const { role, currentUser, data, setData } = useAppState();
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ asset: '', category: 'Equipamiento', type: 'Preventivo' as WorkOrder['type'], description: '', technician: '', date: '' });
  const [pendingStatus, setPendingStatus] = useState<{ id: string; status: WorkOrder['status'] } | null>(null);
  const [observation, setObservation] = useState('');

  const filteredOrders = useMemo(() => data.workOrders.filter((order) => statusFilter === 'Todas' || order.status === statusFilter), [data.workOrders, statusFilter]);

  const createOrder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (role !== 'ADMIN') {
      toast.error('Solo el administrador puede crear órdenes de trabajo.');
      return;
    }
    const order: WorkOrder = {
      id: `OT-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
      ...form,
      asset: form.asset.trim(),
      description: form.description.trim(),
      technician: form.technician.trim(),
      status: 'Diagnóstico',
      observations: [],
    };
    setData((current) => ({ ...current, workOrders: [order, ...current.workOrders] }));
    setForm({ asset: '', category: 'Equipamiento', type: 'Preventivo', description: '', technician: '', date: '' });
    setCreateOpen(false);
    toast.success(`Orden ${order.id} creada.`);
  };

  const saveStatus = () => {
    if (!pendingStatus || observation.trim().length < 3) {
      toast.error('Escribe una observación de al menos 3 caracteres.');
      return;
    }
    setData((current) => ({
      ...current,
      workOrders: current.workOrders.map((order) => order.id === pendingStatus.id ? {
        ...order,
        status: pendingStatus.status,
        observations: [...order.observations, `${new Date().toLocaleString('es-CL')} · ${currentUser.name}: ${observation.trim()}`],
      } : order),
    }));
    setPendingStatus(null);
    setObservation('');
    toast.success('Estado y observación guardados.');
  };

  const badgeStyle: Record<WorkOrder['status'], string> = {
    Diagnóstico: 'border-sky-200 bg-sky-50 text-sky-700',
    'En Proceso': 'border-amber-200 bg-amber-50 text-amber-700',
    'Esperando Repuesto': 'border-violet-200 bg-violet-50 text-violet-700',
    Finalizada: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><h1 className="text-2xl font-bold">Órdenes de Trabajo (OT) &amp; Mantención</h1><p className="mt-1 text-sm text-slate-500">Control de mantenimiento preventivo y correctivo del pañol CITT.</p></div>
        {role === 'ADMIN' && <Button onClick={() => setCreateOpen(true)}><Plus className="mr-1 h-4 w-4" /> Crear Orden de Trabajo</Button>}
      </div>

      <div className="flex flex-wrap gap-2">
        {['Todas', ...statusList].map((status) => <Button key={status} size="sm" variant={statusFilter === status ? 'default' : 'outline'} onClick={() => setStatusFilter(status)}>{status}</Button>)}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredOrders.map((order) => (
          <article key={order.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
            <div className="flex items-start justify-between gap-2"><span className="font-mono text-xs font-bold text-sky-600">{order.id}</span><Badge variant="outline" className={badgeStyle[order.status]}>{order.status}</Badge></div>
            <div><h2 className="font-bold">{order.asset}</h2><p className="mt-1 text-xs text-slate-500">{order.category} · {order.type}</p></div>
            <p className="text-xs leading-relaxed text-slate-500">{order.description}</p>
            <div className="border-t pt-3 text-xs text-slate-500 dark:border-slate-700"><p>Técnico: {order.technician || 'Sin asignar'}</p><p>Fecha: {order.date || 'Sin fecha'}</p></div>
            {order.observations.length > 0 && <details className="text-xs"><summary className="cursor-pointer font-semibold">Observaciones ({order.observations.length})</summary><ul className="mt-2 space-y-1 text-slate-500">{order.observations.map((item, index) => <li key={`${order.id}-${index}`}>{item}</li>)}</ul></details>}
            {role !== 'GLOBAL' && <label className="block text-xs font-semibold">Cambiar estado<select value={order.status} onChange={(event) => setPendingStatus({ id: order.id, status: event.target.value as WorkOrder['status'] })} className="mt-1 block w-full rounded-lg border bg-background p-2 text-xs dark:border-slate-700">{statusList.map((status) => <option key={status}>{status}</option>)}</select></label>}
          </article>
        ))}
        {!filteredOrders.length && <div className="col-span-full rounded-xl border border-dashed p-10 text-center text-sm text-slate-500"><Wrench className="mx-auto mb-2 h-7 w-7" />No hay órdenes con ese estado.</div>}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Crear Orden de Trabajo</DialogTitle><DialogDescription>Registra el tipo y el equipo asociado al mantenimiento.</DialogDescription></DialogHeader>
          <form onSubmit={createOrder} className="space-y-3">
            <label className="block text-sm font-medium">Activo<Input required value={form.asset} onChange={(event) => setForm({ ...form, asset: event.target.value })} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">Categoría<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-1 block w-full rounded-lg border bg-background p-2.5 dark:border-slate-700">{data.settings.categories.map(({ name }) => <option key={name}>{name}</option>)}</select></label>
              <label className="block text-sm font-medium">Tipo<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as WorkOrder['type'] })} className="mt-1 block w-full rounded-lg border bg-background p-2.5 dark:border-slate-700"><option>Preventivo</option><option>Correctivo</option></select></label>
            </div>
            <label className="block text-sm font-medium">Descripción<textarea required minLength={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} className="mt-1 block w-full rounded-lg border bg-background p-2.5 dark:border-slate-700" /></label>
            <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-medium">Técnico / Área<Input value={form.technician} onChange={(event) => setForm({ ...form, technician: event.target.value })} /></label><label className="block text-sm font-medium">Fecha<Input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label></div>
            <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button><Button type="submit">Crear orden</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(pendingStatus)} onOpenChange={(open) => { if (!open) { setPendingStatus(null); setObservation(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Observación del cambio de estado</DialogTitle><DialogDescription>Deja constancia de por qué cambia la orden.</DialogDescription></DialogHeader>
          <label className="block text-sm font-medium">Observación obligatoria<textarea autoFocus minLength={3} value={observation} onChange={(event) => setObservation(event.target.value)} rows={4} className="mt-1 block w-full rounded-lg border bg-background p-2.5 dark:border-slate-700" /></label>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => { setPendingStatus(null); setObservation(''); }}>Cancelar</Button><Button onClick={saveStatus} disabled={observation.trim().length < 3}>Guardar cambio</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
