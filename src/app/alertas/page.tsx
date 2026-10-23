'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Bell, Clock3, PackageX, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppState } from '@/components/app-state';
import { Button } from '@/components/ui/button';
import { ViewToolbar } from '@/components/view-toolbar';

interface AlertEntry {
  id: string;
  title: string;
  description: string;
  href: string;
  category: 'stock' | 'vencimiento' | 'mantenimiento';
  date: string;
}

function AlertGroup({ title, icon: Icon, color, entries }: {
  title: string;
  icon: LucideIcon;
  color: string;
  entries: AlertEntry[];
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
      <h2 className="flex items-center gap-2 font-bold"><Icon className={`h-4 w-4 ${color}`} />{title}</h2>
      {!entries.length ? <p className="text-xs text-slate-500">No hay alertas activas en esta categoría.</p> : entries.map((entry) => (
        <article key={entry.id} className="flex flex-col justify-between gap-3 rounded-xl border border-slate-100 p-3 text-sm dark:border-slate-800 sm:flex-row sm:items-center">
          <div><strong>{entry.title}:</strong><p className="mt-1 text-xs text-slate-500">{entry.description}</p></div>
          <Button asChild size="sm" variant="outline"><Link href={entry.href}>Ver detalle</Link></Button>
        </article>
      ))}
    </section>
  );
}

export default function AlertasPage() {
  const { data, setData } = useAppState();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos los Tipos');
  const [dateFilter, setDateFilter] = useState('');
  const [reviewFilter, setReviewFilter] = useState('Pendientes');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const criticalAssets = useMemo(() => data.assets.filter((asset) =>
    asset.available === 0 || (asset.total > 0 && asset.available / asset.total * 100 <= data.settings.lowStockThreshold),
  ), [data.assets, data.settings.lowStockThreshold]);
  const overdueMembers = useMemo(() => data.members.filter((member) => member.blocked), [data.members]);
  const activeMaintenance = useMemo(() => data.workOrders.filter((order) => order.status !== 'Finalizada'), [data.workOrders]);
  const actionable = useMemo<AlertEntry[]>(() => [
    ...criticalAssets.map((asset) => ({ id: `stock-${asset.code}`, title: 'Stock Crítico', description: `${asset.name}: ${asset.available} ${asset.unitType === 'KG' ? 'kg' : 'unidades'} disponibles.`, href: '/inventario', category: 'stock' as const, date: data.orders.find((order) => order.assetCode === asset.code)?.createdAt.slice(0, 10) ?? '' })),
    ...overdueMembers.map((member) => ({ id: `overdue-${member.id}`, title: 'Préstamo Vencido / Morosidad', description: `${member.name} mantiene ${member.loans} préstamo(s) activo(s) con atraso de ${member.overdueDays} día(s).`, href: '/miembros', category: 'vencimiento' as const, date: data.orders.find((order) => order.run.toLowerCase() === member.run.toLowerCase())?.createdAt.slice(0, 10) ?? '' })),
    ...activeMaintenance.map((order) => ({ id: `ot-${order.id}`, title: 'Mantención en curso', description: `${order.asset}: ${order.status}.`, href: '/mantenimiento', category: 'mantenimiento' as const, date: order.date })),
  ], [activeMaintenance, criticalAssets, data.orders, overdueMembers]);

  const dismissed = useMemo(() => new Set(data.dismissedAlerts), [data.dismissedAlerts]);

  const dismiss = (id: string) => {
    setData((current) => ({ ...current, dismissedAlerts: current.dismissedAlerts.includes(id) ? current.dismissedAlerts : [...current.dismissedAlerts, id] }));
  };

  const filteredAlerts = useMemo(() => actionable.filter((alert) => {
    const matchesSearch = `${alert.title} ${alert.description}`.toLowerCase().includes(query.toLowerCase());
    const matchesType = typeFilter === 'Todos los Tipos' || alert.category === typeFilter;
    const matchesDate = !dateFilter || alert.date === dateFilter;
    const isDismissed = dismissed.has(alert.id);
    const matchesReview = reviewFilter === 'Todas' || (reviewFilter === 'Revisadas' ? isDismissed : !isDismissed);
    return matchesSearch && matchesType && matchesDate && matchesReview;
  }), [actionable, dateFilter, dismissed, query, reviewFilter, typeFilter]);
  const visibleActionable = filteredAlerts;

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">Panel de Alertas</h1><p className="mt-1 text-sm text-slate-500">Seguimiento de inventario, devoluciones y tareas operativas de la sede.</p></div>
      <ViewToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Buscar por alerta o descripción..."
        date={dateFilter}
        onDateChange={setDateFilter}
        filter={typeFilter}
        filterOptions={[
          { value: 'Todos los Tipos', label: 'Todos los Tipos' },
          { value: 'stock', label: 'Stock Crítico' },
          { value: 'vencimiento', label: 'Morosidad' },
          { value: 'mantenimiento', label: 'Mantenimiento' },
        ]}
        onFilterChange={setTypeFilter}
        pills={['Pendientes', 'Todas', 'Revisadas'].map((item) => ({ value: item, label: item }))}
        activePill={reviewFilter}
        onPillChange={setReviewFilter}
        view={view}
        onViewChange={setView}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AlertGroup title="Stock Crítico o en Ceros" icon={PackageX} color="text-rose-500" entries={filteredAlerts.filter((item) => item.category === 'stock')} />
        <AlertGroup title="Atrasos de Devolución & Morosos" icon={Clock3} color="text-amber-500" entries={filteredAlerts.filter((item) => item.category === 'vencimiento')} />
      </div>
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
        <h2 className="flex items-center gap-2 border-b pb-3 font-bold dark:border-slate-800"><Bell className="h-4 w-4 text-sky-600" />Bandeja de Alertas Accionables</h2>
        {!visibleActionable.length ? <p className="py-4 text-center text-sm text-slate-500">No hay alertas pendientes con esos filtros.</p> : <div className={view === 'list' ? 'space-y-3' : 'grid grid-cols-1 gap-3 xl:grid-cols-2'}>{visibleActionable.map((alert) => (
          <div key={alert.id} className="flex flex-col justify-between gap-3 rounded-xl border border-slate-100 p-3 text-sm dark:border-slate-800 sm:flex-row sm:items-center">
            <div><strong>{alert.title}</strong><p className="mt-1 text-xs text-slate-500">{alert.description}</p></div>
            <div className="flex gap-2">{dismissed.has(alert.id) ? <Button size="sm" variant="outline" disabled>Revisada</Button> : <><Button asChild size="sm" variant="outline"><Link href={alert.href}>Atender</Link></Button><Button size="sm" onClick={() => dismiss(alert.id)}>Marcar revisada</Button></>}</div>
          </div>
        ))}</div>}
      </section>
      {activeMaintenance.length > 0 && <p className="flex items-center gap-2 text-xs text-slate-500"><Wrench className="h-3.5 w-3.5" />{activeMaintenance.length} órdenes de trabajo siguen activas.</p>}
      {!actionable.length && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300"><AlertTriangle className="h-4 w-4" />Todo está al día.</p>}
    </div>
  );
}
