'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Box,
  Repeat,
  AlertTriangle,
  Download,
  Wrench,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { useAppState } from '@/components/app-state';
import PedidosPage from '@/app/pedidos/page';

export default function DashboardPage() {
  const { role, data } = useAppState();

  // Si el usuario tiene rol Alumno Global, se muestra la vista de Pedidos / Catálogo
  if (role === 'GLOBAL') {
    return <PedidosPage />;
  }

  const totalUnits = data.assets.reduce((sum, item) => sum + item.total, 0);
  const activeLoans = data.orders.filter((order) => order.movementType === 'PRESTAMO' && order.status === 'Recibido').length;
  const criticalStock = data.assets.filter((item) => item.available === 0 || item.available / Math.max(item.total, 1) * 100 <= data.settings.lowStockThreshold).length;
  const activeMaintenance = data.workOrders.filter((order) => order.status !== 'Finalizada').length;
  const kpis = [
    {
      label: 'Total Ítems',
      value: totalUnits.toLocaleString('es-CL', { maximumFractionDigits: 3 }),
      detail: 'Unidades registradas',
      href: '/inventario',
      icon: Box,
      bg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    },
    {
      label: 'Préstamos Activos',
      value: String(activeLoans),
      detail: 'Consultar movimientos',
      href: '/movimientos',
      icon: Repeat,
      bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Stock Crítico',
      value: String(criticalStock),
      detail: criticalStock > 0 ? 'Requiere reposición' : 'Stock dentro del umbral',
      href: '/alertas',
      icon: AlertTriangle,
      bg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    },
    {
      label: 'En Mantención',
      value: String(activeMaintenance),
      detail: activeMaintenance > 0 ? 'Órdenes pendientes' : 'Sin órdenes pendientes',
      href: '/mantenimiento',
      icon: Wrench,
      bg: 'bg-indigo-500/15 text-indigo-500 dark:text-indigo-400',
    },
  ];

  const movementLabels = { PRESTAMO: 'Préstamo', DEVOLUCION: 'Devolución', PEDIDO: 'Pedido', BAJA: 'Baja' } as const;
  const recentMovements = data.orders.slice(0, 5).map((order) => {
    const type = movementLabels[order.movementType ?? 'PRESTAMO'];
    return {
      asset: order.assetName,
      applicant: `${order.requester} (${order.school})`,
      type,
      date: new Date(order.createdAt).toLocaleString('es-CL'),
      badgeColor: type === 'Devolución'
        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
        : type === 'Baja'
          ? 'bg-rose-50 text-rose-600 border-rose-200'
          : 'bg-amber-50 text-amber-600 border-amber-200',
    };
  });

  const exportDashboard = () => {
    const rows = [
      ['Indicador', 'Valor'],
      ['Total de ítems', String(totalUnits)],
      ['Préstamos activos', String(activeLoans)],
      ['Stock crítico', String(criticalStock)],
      ['Órdenes de mantenimiento activas', String(activeMaintenance)],
    ];
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dashboard_citt.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard General</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Resumen operativo y métricas en tiempo real de la sede.</p>
        </div>
        <Button size="sm" onClick={exportDashboard} className="h-10 rounded-xl bg-sky-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-sky-500">
          <Download className="mr-1 h-4 w-4" /> Exportar CSV
        </Button>
      </div>
      {/* 4 Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              aria-label={`Abrir ${kpi.label}`}
              className="group flex min-h-36 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-sky-500/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-800/90 dark:bg-[#111827]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{kpi.label}</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{kpi.value}</p>
                </div>
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${kpi.bg}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors group-hover:text-sky-600 dark:text-slate-400 dark:group-hover:text-sky-400">
                <ArrowRight className="h-4 w-4" />
                <span>{kpi.detail}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Tabla de Últimos Movimientos */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111827]">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Últimos Movimientos Registrados
          </h3>
          <Link
            href="/movimientos"
            className="text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline flex items-center gap-1"
          >
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-3.5">Activo</th>
                <th className="p-3.5">Solicitante</th>
                <th className="p-3.5">Tipo</th>
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5 text-right">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentMovements.map((mov) => (
                <tr
                  key={`${mov.asset}-${mov.date}`}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="p-3.5 font-semibold text-slate-800 dark:text-white">
                    {mov.asset}
                  </td>
                  <td className="p-3.5 text-slate-500 dark:text-slate-400">
                    {mov.applicant}
                  </td>
                  <td className="p-3.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold ${mov.badgeColor}`}
                    >
                      {mov.type}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-slate-500 dark:text-slate-400">
                    {mov.date}
                  </td>
                  <td className="p-3.5 text-right">
                    <Link
                      href="/movimientos"
                      className="text-sky-600 dark:text-sky-400 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" /> Ver Ficha
                    </Link>
                  </td>
                </tr>
              ))}
              {!recentMovements.length && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Todavía no hay movimientos registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
