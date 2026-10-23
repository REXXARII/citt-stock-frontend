'use client';

import { useEffect, useState } from 'react';
import { Camera, Plus, Save, ScanLine, Trash2, Usb } from 'lucide-react';
import { toast } from 'sonner';
import { useAppState } from '@/components/app-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function ConfiguracionPage() {
  const { role, data, setData } = useAppState();
  const [draft, setDraft] = useState(data.settings);
  const [newCategory, setNewCategory] = useState('');
  const [newPrefix, setNewPrefix] = useState('');
  const [scanner, setScanner] = useState({ camera: false, usb: false });

  // AppStateProvider hydrates saved settings after mount; keep this form draft in sync.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setDraft(data.settings), [data.settings]);

  const update = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => setDraft((current) => ({ ...current, [key]: value }));

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (role !== 'ADMIN') {
      toast.error('Parametrización disponible solo para administradores.');
      return;
    }
    if (!draft.campus.trim() || !draft.replenishmentEmail.includes('@')) {
      toast.error('Revisa el nombre de sede y el correo de reabastecimiento.');
      return;
    }
    setData((current) => ({ ...current, settings: draft }));
    toast.success('Parámetros del sistema guardados.');
  };

  const addCategory = () => {
    const name = newCategory.trim();
    const prefix = newPrefix.trim().toUpperCase();
    if (!name || !/^[A-Z0-9-]+-$/.test(prefix)) {
      toast.error('Ingresa un nombre y un prefijo que termine en guion (por ejemplo, EQ-CITT-).');
      return;
    }
    if (draft.categories.some((category) => category.name.toLowerCase() === name.toLowerCase() || category.prefix === prefix)) {
      toast.error('La categoría o el prefijo ya están registrados.');
      return;
    }
    update('categories', [...draft.categories, { name, prefix }]);
    setNewCategory('');
    setNewPrefix('');
  };

  const toggleLocker = (name: string) => {
    update('lockers', draft.lockers.map((locker) => locker.name === name
      ? { ...locker, status: locker.status === 'Disponible' ? 'Ocupado' : 'Disponible' }
      : locker));
  };

  if (role !== 'ADMIN') return <p className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">Parametrización disponible solo para administradores.</p>;

  return (
    <div className="max-w-5xl space-y-5">
      <div><h1 className="text-2xl font-bold">Parametrización del Sistema</h1><p className="mt-1 text-sm text-slate-500">Configuración global, reglas de préstamo, alertas, categorías y casilleros de la sede.</p></div>

      <form onSubmit={save} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-sm">Sede, reglas y tiempos de préstamo</CardTitle><CardDescription>Los límites participan en las validaciones del flujo de préstamos.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <label className="block text-sm font-medium">Nombre de sede / organización<Input required value={draft.campus} onChange={(event) => update('campus', event.target.value)} /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium">Préstamo alumnos (horas)<Input type="number" min={1} required value={draft.studentLoanHours} onChange={(event) => update('studentLoanHours', Number(event.target.value))} /></label>
                <label className="block text-sm font-medium">Plazo docentes (días)<Input type="number" min={1} required value={draft.staffLoanDays} onChange={(event) => update('staffLoanDays', Number(event.target.value))} /></label>
                <label className="block text-sm font-medium">Equipos simultáneos por alumno<Input type="number" min={1} required value={draft.studentEquipmentLimit} onChange={(event) => update('studentEquipmentLimit', Number(event.target.value))} /></label>
                <label className="block text-sm font-medium">Bloqueo por morosidad (días)<Input type="number" min={1} required value={draft.overdueBlockDays} onChange={(event) => update('overdueBlockDays', Number(event.target.value))} /></label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Notificaciones, firma y alertas</CardTitle><CardDescription>Define reglas generales para el seguimiento operativo.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <label className="block text-sm font-medium">Umbral de stock bajo (%)<Input type="number" min={1} max={100} required value={draft.lowStockThreshold} onChange={(event) => update('lowStockThreshold', Number(event.target.value))} /></label>
              <label className="block text-sm font-medium">Correo para reabastecimiento<Input type="email" required value={draft.replenishmentEmail} onChange={(event) => update('replenishmentEmail', event.target.value)} /></label>
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={draft.emailNotifications} onChange={(event) => update('emailNotifications', event.target.checked)} className="mt-1 accent-sky-600" /><span><strong>Notificaciones automáticas por email</strong><span className="block text-xs text-slate-500">Avisos de vencimiento a solicitantes.</span></span></label>
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={draft.strictDigitalSignature} onChange={(event) => update('strictDigitalSignature', event.target.checked)} className="mt-1 accent-sky-600" /><span><strong>Modo estricto de firma digital</strong><span className="block text-xs text-slate-500">Requerir firma para registrar cada entrega.</span></span></label>
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={draft.automaticOverdueBlock} onChange={(event) => update('automaticOverdueBlock', event.target.checked)} className="mt-1 accent-sky-600" /><span><strong>Bloqueo automático por morosidad</strong><span className="block text-xs text-slate-500">Impedir solicitudes a personas con atrasos.</span></span></label>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3"><div><CardTitle className="text-sm">Categorías registradas y prefijos QR</CardTitle><CardDescription>Se usan para generar códigos nuevos en el inventario.</CardDescription></div></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">{draft.categories.map((category) => <span key={category.prefix} className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300">{category.name}<code>{category.prefix}</code><button type="button" aria-label={`Eliminar ${category.name}`} onClick={() => update('categories', draft.categories.filter((item) => item.prefix !== category.prefix))}><Trash2 className="h-3.5 w-3.5 text-rose-500" /></button></span>)}</div>
            <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_1fr_auto]"><label className="text-sm font-medium">Nueva categoría<Input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Ej. Sensores" /></label><label className="text-sm font-medium">Prefijo QR<Input value={newPrefix} onChange={(event) => setNewPrefix(event.target.value)} placeholder="SEN-CITT-" /></label><Button type="button" variant="outline" onClick={addCategory}><Plus className="mr-1 h-4 w-4" /> Agregar</Button></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Casilleros / Ubicaciones</CardTitle><CardDescription>Actualiza disponibilidad de las ubicaciones existentes.</CardDescription></CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {draft.lockers.map((locker) => <div key={locker.name} className="flex items-center justify-between rounded-lg border p-3 text-sm dark:border-slate-700"><span>{locker.name}</span><Button type="button" size="sm" variant="outline" disabled={locker.status === 'Excepción'} onClick={() => toggleLocker(locker.name)}>{locker.status}</Button></div>)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Conexiones de escáner</CardTitle><CardDescription>Estado de los periféricos utilizados para registrar activos.</CardDescription></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button type="button" variant={scanner.camera ? 'default' : 'outline'} onClick={() => setScanner((state) => ({ ...state, camera: !state.camera }))}><Camera className="mr-1 h-4 w-4" /> Cámara: {scanner.camera ? 'Conectada' : 'Desconectada'}</Button>
            <Button type="button" variant={scanner.usb ? 'default' : 'outline'} onClick={() => setScanner((state) => ({ ...state, usb: !state.usb }))}><Usb className="mr-1 h-4 w-4" /> USB: {scanner.usb ? 'Conectado' : 'Desconectado'}</Button>
            <span className="inline-flex items-center gap-1 px-2 text-xs text-slate-500"><ScanLine className="h-4 w-4" /> Los cambios de conexión son una simulación visual.</span>
          </CardContent>
        </Card>

        <div className="flex justify-end border-t pt-4"><Button type="submit"><Save className="mr-1 h-4 w-4" /> Guardar Cambios</Button></div>
      </form>
    </div>
  );
}
