'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Download, Eye, Grid2X2, List, MapPin, PackagePlus, Plus, QrCode, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppState, type AssetCategory, type AssetRecord, type AssetUnit } from '@/components/app-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { QRCodeSVG } from 'qrcode.react';

const defaultCategories: AssetCategory[] = ['Equipamiento', '3D', 'Talleres', 'Mobiliario'];
const defaultPrefixes: Record<string, string> = {
  Equipamiento: 'EQ-CITT-',
  '3D': '3D-CITT-',
  Talleres: 'TA-CITT-',
  Mobiliario: 'IM-CITT-',
};

function exportCsv(assets: AssetRecord[]) {
  const rows = [['Código', 'Activo', 'Categoría', 'Ubicación', 'Disponible', 'Total', 'Unidad', 'Estado'], ...assets.map((asset) => [
    asset.code, asset.name, asset.category, asset.location, String(asset.available), String(asset.total), asset.unitType, asset.status,
  ])];
  const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'inventario_citt.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export default function InventarioPage() {
  const { role, data, setData } = useAppState();
  const categories = [...new Set([...defaultCategories, ...data.settings.categories.map((item) => item.name)])];
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<AssetCategory | 'Todos'>('Todos');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [selected, setSelected] = useState<AssetRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [operation, setOperation] = useState<'new' | 'restock'>('new');
  const [categoryInput, setCategoryInput] = useState<AssetCategory>('Equipamiento');
  const [unitType, setUnitType] = useState<AssetUnit>('UNID');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [initialStock, setInitialStock] = useState('1');
  const [initialTotal, setInitialTotal] = useState('1');
  const [restockCode, setRestockCode] = useState('');
  const [restockQuantity, setRestockQuantity] = useState('1');

  const filteredAssets = useMemo(() => data.assets.filter((asset) => {
    const matchesCategory = category === 'Todos' || asset.category === category;
    const matchesQuery = `${asset.code} ${asset.name} ${asset.location}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [category, data.assets, query]);

  const openCreateForm = (mode: 'new' | 'restock') => {
    setOperation(mode);
    setName('');
    setLocation('');
    setDescription('');
    setInitialStock('1');
    setInitialTotal('1');
    setRestockCode(data.assets[0]?.code ?? '');
    setRestockQuantity('1');
    setFormOpen(true);
  };

  const handleSave = () => {
    if (role !== 'ADMIN') {
      toast.error('Solo el administrador puede modificar el inventario.');
      return;
    }
    if (operation === 'restock') {
      const amount = Number(restockQuantity);
      const asset = data.assets.find((item) => item.code === restockCode);
      if (!asset || !Number.isFinite(amount) || amount <= 0 || (asset.unitType === 'UNID' && !Number.isInteger(amount))) {
        toast.error('Selecciona un activo y una cantidad válida.');
        return;
      }
      setData((current) => ({
        ...current,
        assets: current.assets.map((item) => item.code === asset.code
          ? { ...item, available: Number((item.available + amount).toFixed(3)), total: Number((item.total + amount).toFixed(3)), status: 'Disponible' }
          : item),
      }));
      toast.success(`Stock repuesto para ${asset.code}.`);
      setFormOpen(false);
      return;
    }

    const available = Number(initialStock);
    const total = Number(initialTotal);
    if (!name.trim() || !location.trim() || !Number.isFinite(available) || !Number.isFinite(total) || available < 0 || total < available ||
      (unitType === 'UNID' && (!Number.isInteger(available) || !Number.isInteger(total)))) {
      toast.error('Revisa el nombre, ubicación y cantidades del activo.');
      return;
    }
    const prefix = data.settings.categories.find((item) => item.name === categoryInput)?.prefix
      ?? defaultPrefixes[categoryInput]
      ?? `${categoryInput.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/-+$/g, '')}-CITT-`;
    const nextNumber = data.assets
      .filter((asset) => asset.code.startsWith(prefix))
      .reduce((max, asset) => Math.max(max, Number(asset.code.slice(prefix.length)) || 0), 0) + 1;
    const code = `${prefix}${String(nextNumber).padStart(3, '0')}`;
    const asset: AssetRecord = {
      code,
      name: name.trim(),
      category: categoryInput,
      location: location.trim(),
      unitType,
      returnable: unitType === 'UNID',
      available,
      total,
      description: description.trim(),
      status: available === 0 ? 'Stock Crítico' : 'Disponible',
    };
    setData((current) => ({ ...current, assets: [asset, ...current.assets] }));
    toast.success(`Activo registrado con código ${code}.`);
    setFormOpen(false);
  };

  const retireAsset = (asset: AssetRecord) => {
    if (role !== 'ADMIN') return;
    setData((current) => ({
      ...current,
      assets: current.assets.map((item) => item.code === asset.code ? { ...item, status: 'De Baja', available: 0 } : item),
    }));
    setSelected(null);
    toast.success(`${asset.code} fue dado de baja.`);
  };

  const printSelectedQr = () => {
    if (!selected) return;
    const qrElement = document.querySelector('#asset-qr svg');
    const printWindow = window.open('', '_blank', 'width=420,height=520');
    if (!printWindow) {
      toast.error('El navegador bloqueó la ventana de impresión. Permite las ventanas emergentes e inténtalo otra vez.');
      return;
    }
    if (!qrElement) {
      printWindow.close();
      toast.error('No se pudo generar el código QR del activo.');
      return;
    }

    printWindow.document.title = `QR ${selected.code}`;
    printWindow.document.body.style.cssText = 'margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Arial,sans-serif';
    const qr = printWindow.document.importNode(qrElement, true);
    qr.setAttribute('width', '240');
    qr.setAttribute('height', '240');
    const label = printWindow.document.createElement('p');
    label.textContent = `${selected.code} · ${selected.name}`;
    label.style.cssText = 'max-width:320px;margin:20px;text-align:center;font-weight:700';
    printWindow.document.body.replaceChildren(qr, label);
    window.setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  const assetCard = (asset: AssetRecord) => (
    <article key={asset.code} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
      <div className="flex items-start justify-between gap-2">
        <div><p className="font-mono text-xs font-bold text-sky-600">{asset.code}</p><h3 className="mt-1 font-bold">{asset.name}</h3></div>
        <Badge variant="outline">{asset.category}</Badge>
      </div>
      <div className="mt-4 space-y-2 text-xs text-slate-500">
        <p className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{asset.location}</p>
        <p className={asset.available <= 1 ? 'font-semibold text-amber-600' : 'font-semibold text-emerald-600'}>{asset.available} / {asset.total} {asset.unitType === 'KG' ? 'kg' : 'unid.'} disponibles</p>
        <Badge variant="outline" className={asset.status === 'De Baja' ? 'border-rose-200 text-rose-600' : asset.available === 0 ? 'border-amber-200 text-amber-600' : 'border-emerald-200 text-emerald-600'}>{asset.status}</Badge>
      </div>
      <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setSelected(asset)}><Eye className="mr-1 h-3.5 w-3.5" /> Ver ficha / QR</Button>
    </article>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><h1 className="text-2xl font-bold">Catálogo de Activos &amp; Generador QR</h1><p className="mt-1 text-sm text-slate-500">Inventario físico, control de stock y etiquetado por código único.</p></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => exportCsv(filteredAssets)}><Download className="mr-1 h-4 w-4" /> Exportar CSV</Button>
          <Button variant="outline" disabled={role !== 'ADMIN'} onClick={() => openCreateForm('restock')}><PackagePlus className="mr-1 h-4 w-4" /> Reponer stock</Button>
          <Button disabled={role !== 'ADMIN'} onClick={() => openCreateForm('new')}><Plus className="mr-1 h-4 w-4" /> Nuevo activo</Button>
        </div>
      </div>

      {role !== 'ADMIN' && <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/20 dark:text-amber-300">El rol actual puede consultar el inventario, pero no agregar activos ni reponer stock.</p>}

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por código, nombre o ubicación..." className="pl-9" /></div>
          <div className="flex gap-2">
            <Button size="icon" variant={view === 'list' ? 'default' : 'outline'} onClick={() => setView('list')} aria-label="Vista de lista"><List className="h-4 w-4" /></Button>
            <Button size="icon" variant={view === 'grid' ? 'default' : 'outline'} onClick={() => setView('grid')} aria-label="Vista de tarjetas"><Grid2X2 className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['Todos', ...categories] as const).map((item) => <Button key={item} size="sm" variant={category === item ? 'default' : 'outline'} onClick={() => setCategory(item)}>{item}</Button>)}
        </div>
        {view === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead className="border-b bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900/60"><tr>{['Código QR', 'Nombre Activo', 'Categoría', 'Ubicación', 'Stock Disponible', 'Estado', 'Acciones'].map((label) => <th key={label} className="p-3">{label}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAssets.map((asset) => (
                  <tr key={asset.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-mono font-semibold text-sky-600">{asset.code}</td><td className="p-3 font-semibold">{asset.name}</td><td className="p-3">{asset.category}</td><td className="p-3"><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-sky-500" />{asset.location}</span></td>
                    <td className="p-3">{asset.available} {asset.unitType === 'KG' ? 'kg' : 'unid.'} <span className="text-slate-400">/ {asset.total}</span></td>
                    <td className="p-3"><Badge variant="outline" className={asset.available === 0 ? 'border-rose-200 text-rose-600' : 'border-emerald-200 text-emerald-600'}>{asset.status}</Badge></td>
                    <td className="p-3"><Button size="sm" variant="ghost" onClick={() => setSelected(asset)} aria-label={`Ver ${asset.name}`}><Eye className="h-4 w-4" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredAssets.length && <p className="py-8 text-center text-sm text-slate-500">No hay activos que coincidan con la búsqueda.</p>}
          </div>
        ) : <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">{filteredAssets.map(assetCard)}</div>}
      </section>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{operation === 'new' ? 'Registrar activo' : 'Reponer stock'}</DialogTitle><DialogDescription>Los cambios se guardan en los datos de demostración de este navegador.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <label className="block text-sm font-medium">Operación<select value={operation} onChange={(event) => setOperation(event.target.value as 'new' | 'restock')} className="mt-1 block w-full rounded-lg border bg-background p-2.5 dark:border-slate-700"><option value="new">Nuevo activo</option><option value="restock">Reponer stock</option></select></label>
            {operation === 'restock' ? (
              <>
                <label className="block text-sm font-medium">Activo<select value={restockCode} onChange={(event) => setRestockCode(event.target.value)} className="mt-1 block w-full rounded-lg border bg-background p-2.5 dark:border-slate-700">{data.assets.map((asset) => <option key={asset.code} value={asset.code}>{asset.code} · {asset.name}</option>)}</select></label>
                <label className="block text-sm font-medium">Cantidad<Input type="number" min={0.001} step="any" value={restockQuantity} onChange={(event) => setRestockQuantity(event.target.value)} /></label>
              </>
            ) : (
              <>
                <label className="block text-sm font-medium">Nombre<Input value={name} onChange={(event) => setName(event.target.value)} required /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm font-medium">Categoría<select value={categoryInput} onChange={(event) => setCategoryInput(event.target.value as AssetCategory)} className="mt-1 block w-full rounded-lg border bg-background p-2.5 dark:border-slate-700">{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
                  <label className="block text-sm font-medium">Unidad<select value={unitType} onChange={(event) => setUnitType(event.target.value as AssetUnit)} className="mt-1 block w-full rounded-lg border bg-background p-2.5 dark:border-slate-700"><option value="UNID">Unidades</option><option value="KG">Kilogramos</option></select></label>
                </div>
                <label className="block text-sm font-medium">Ubicación<Input value={location} onChange={(event) => setLocation(event.target.value)} required /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm font-medium">Stock disponible<Input type="number" min={0} step={unitType === 'KG' ? '0.001' : '1'} value={initialStock} onChange={(event) => setInitialStock(event.target.value)} /></label>
                  <label className="block text-sm font-medium">Stock total<Input type="number" min={0} step={unitType === 'KG' ? '0.001' : '1'} value={initialTotal} onChange={(event) => setInitialTotal(event.target.value)} /></label>
                </div>
                <label className="block text-sm font-medium">Descripción<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} className="mt-1 block w-full rounded-lg border bg-background p-2.5 dark:border-slate-700" /></label>
                <p className="text-xs text-slate-500">Código QR generado al guardar: {data.settings.categories.find((item) => item.name === categoryInput)?.prefix ?? defaultPrefixes[categoryInput] ?? 'CITT-'}###</p>
              </>
            )}
            <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button><Button onClick={handleSave}>Guardar</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{selected?.name}</DialogTitle><DialogDescription>Ficha de activo CITT · {selected?.code}</DialogDescription></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div id="asset-qr" className="flex flex-col items-center rounded-xl border border-dashed bg-white p-6 dark:border-slate-700 dark:bg-white">
                <QRCodeSVG value={selected.code} size={180} level="M" title={`Código QR ${selected.code}`} />
                <span className="mt-2 font-mono text-sm font-bold text-slate-900">{selected.code}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm"><p><span className="text-xs text-slate-500">Categoría</span><strong className="block">{selected.category}</strong></p><p><span className="text-xs text-slate-500">Stock actual</span><strong className="block">{selected.available} / {selected.total} {selected.unitType}</strong></p><p className="col-span-2"><span className="text-xs text-slate-500">Ubicación</span><strong className="block">{selected.location}</strong></p><p className="col-span-2 text-xs text-slate-500">{selected.description}</p></div>
              {selected.available === 0 && <p className="flex items-center gap-2 text-xs text-amber-600"><AlertTriangle className="h-4 w-4" /> Stock agotado o crítico</p>}
              <div className="flex justify-end border-t pt-3"><Button variant="outline" size="sm" onClick={printSelectedQr}><QrCode className="mr-1 h-3.5 w-3.5" /> Imprimir QR</Button></div>
              {role === 'ADMIN' && selected.status !== 'De Baja' && <div className="flex justify-end border-t pt-3"><Button variant="destructive" size="sm" onClick={() => retireAsset(selected)}><Trash2 className="mr-1 h-3.5 w-3.5" /> Dar de baja</Button></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
