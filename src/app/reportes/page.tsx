'use client';

import { useMemo } from 'react';
import { Download, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAppState } from '@/components/app-state';
import { Button } from '@/components/ui/button';

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  toast.success(`Se exportó ${filename}.`);
}

export default function ReportesPage() {
  const { data } = useAppState();
  const popularAssets = useMemo(() => data.assets.map((asset) => ({
    name: asset.name,
    count: data.orders.filter((order) => order.assetCode === asset.code).length,
  })).sort((left, right) => right.count - left.count), [data.assets, data.orders]);
  const schoolUsage = useMemo(() => {
    const schools = [...new Set(data.orders.map((order) => order.school))];
    return schools.map((school) => ({ school, count: data.orders.filter((order) => order.school === school).length }));
  }, [data.orders]);
  const maxAssetCount = Math.max(1, ...popularAssets.map((item) => item.count));
  const maxSchoolCount = Math.max(1, ...schoolUsage.map((item) => item.count));

  const inventoryRows = [['Código', 'Activo', 'Categoría', 'Ubicación', 'Disponible', 'Total', 'Unidad', 'Estado'], ...data.assets.map((asset) => [asset.code, asset.name, asset.category, asset.location, String(asset.available), String(asset.total), asset.unitType, asset.status])];
  const movementRows = [['Folio', 'Fecha', 'Activo', 'Cantidad', 'Solicitante', 'RUN', 'Escuela', 'Tipo', 'Estado'], ...data.orders.map((order) => [order.id, order.createdAt, order.assetName, `${order.quantity} ${order.unit}`, order.requester, order.run, order.school, order.movementType ?? 'PEDIDO', order.status])];
  const maintenanceRows = [['Folio', 'Activo', 'Categoría', 'Tipo', 'Estado', 'Técnico', 'Fecha'], ...data.workOrders.map((order) => [order.id, order.asset, order.category, order.type, order.status, order.technician, order.date])];

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">Reportes y Analítica</h1><p className="mt-1 text-sm text-slate-500">Uso, rotación de activos y rendimiento operativo de la sede.</p></div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
          <h2 className="flex items-center gap-2 font-bold"><TrendingUp className="h-4 w-4 text-sky-600" />Equipos más solicitados</h2>
          {popularAssets.map((item) => <div key={item.name}><div className="mb-1 flex justify-between gap-3 text-xs"><span className="truncate">{item.name}</span><strong>{item.count}</strong></div><div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 rounded-full bg-sky-500" style={{ width: `${Math.max(item.count ? 8 : 0, item.count / maxAssetCount * 100)}%` }} /></div></div>)}
          {!data.orders.length && <p className="text-xs text-slate-500">Los datos de uso aparecerán cuando se registren solicitudes.</p>}
        </section>
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
          <h2 className="font-bold">Uso por Escuela / Área</h2>
          {!schoolUsage.length ? <p className="text-xs text-slate-500">Todavía no hay movimientos agrupados por escuela.</p> : schoolUsage.map((item) => <div key={item.school}><div className="mb-1 flex justify-between text-xs"><span>{item.school}</span><strong>{item.count}</strong></div><div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${item.count / maxSchoolCount * 100}%` }} /></div></div>)}
        </section>
      </div>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
        <h2 className="font-bold">Exportación de Reportes CSV</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { title: 'Inventario Completo', description: 'Activos, categorías, ubicación y stock disponible.', filename: 'inventario_citt.csv', rows: inventoryRows },
            { title: 'Historial de Movimientos', description: 'Solicitudes, préstamos, devoluciones y estados.', filename: 'movimientos_citt.csv', rows: movementRows },
            { title: 'Mantenimientos', description: 'Órdenes de trabajo, tipos, técnicos y estados.', filename: 'mantenimientos_citt.csv', rows: maintenanceRows },
          ].map((report) => <article key={report.filename} className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50"><div><h3 className="font-bold">{report.title}</h3><p className="mt-1 text-xs text-slate-500">{report.description}</p></div><Button onClick={() => downloadCsv(report.filename, report.rows)}><Download className="mr-1 h-4 w-4" /> Exportar CSV</Button></article>)}
        </div>
      </section>
    </div>
  );
}
