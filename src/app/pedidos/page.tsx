'use client';

import { useMemo, useState } from 'react';
import { CalendarClock, Package, Plus, Search, ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppState, type AssetCategory, type OrderRecord } from '@/components/app-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const categories: { value: AssetCategory | 'Todos'; label: string }[] = [
  { value: 'Todos', label: 'Todos' },
  { value: 'Equipamiento', label: 'Electrónica & Robótica' },
  { value: '3D', label: 'Impresión 3D' },
  { value: 'Talleres', label: 'Herramientas & Medición' },
  { value: 'Mobiliario', label: 'Mobiliario' },
];

const statusColor: Record<OrderRecord['status'], string> = {
  Solicitado: 'bg-amber-50 text-amber-700 border-amber-200',
  Aceptado: 'bg-sky-50 text-sky-700 border-sky-200',
  Preparado: 'bg-violet-50 text-violet-700 border-violet-200',
  Enviado: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Recibido: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rechazado: 'bg-rose-50 text-rose-700 border-rose-200',
};

interface CartLine {
  code: string;
  quantity: number;
}

export default function PedidosPage() {
  const { role, currentUser, data, setData } = useAppState();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<AssetCategory | 'Todos'>('Todos');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [durationDays, setDurationDays] = useState(1);
  const [ordersTab, setOrdersTab] = useState<'catalog' | 'orders'>('catalog');

  const filteredAssets = useMemo(() => data.assets.filter((asset) => {
    const matchesCategory = category === 'Todos' || asset.category === category;
    const matchesQuery = `${asset.code} ${asset.name} ${asset.location}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [category, data.assets, query]);

  const myOrders = data.orders.filter((order) =>
    order.run.toLowerCase() === currentUser.run.toLowerCase() || order.ownerRole === role,
  );

  const addToCart = (code: string) => {
    const asset = data.assets.find((item) => item.code === code);
    if (!asset || asset.available <= 0) {
      toast.error('Este activo no tiene stock disponible.');
      return;
    }
    setCart((current) => {
      const line = current.find((item) => item.code === code);
      if (!line) return [...current, { code, quantity: 1 }];
      return current.map((item) => item.code === code
        ? { ...item, quantity: Math.min(item.quantity + 1, asset.unitType === 'KG' ? Math.floor(asset.available * 1000) : asset.available) }
        : item);
    });
    toast.success('Activo agregado a tu solicitud.');
  };

  const submitRequest = () => {
    if (!cart.length) {
      toast.error('Agrega al menos un activo a tu solicitud.');
      return;
    }
    if (notes.trim().length < 3) {
      toast.error('Indica el motivo o taller para esta solicitud.');
      return;
    }
    if (data.members.some((member) => member.run.toLowerCase() === currentUser.run.toLowerCase() && member.blocked)) {
      toast.error('Tu cuenta está bloqueada por morosidad y no puede solicitar activos.');
      return;
    }
    const insufficient = cart.find(({ code, quantity }) => {
      const asset = data.assets.find((item) => item.code === code);
      return !asset || (asset.unitType === 'KG' ? quantity / 1000 : quantity) > asset.available;
    });
    if (insufficient) {
      toast.error('La cantidad solicitada supera el stock disponible.');
      return;
    }

    const createdAt = new Date().toISOString();
    const newOrders: OrderRecord[] = cart.map(({ code, quantity }, index) => {
      const asset = data.assets.find((item) => item.code === code);
      if (!asset) throw new Error(`No se encontró el activo ${code}.`);
      const requestId = `${asset.category === 'Equipamiento' ? 'TRX' : asset.category === '3D' ? '3D' : asset.category === 'Talleres' ? 'TA' : 'IM'}-${String(Date.now() + index).slice(-8)}`;
      const actor = currentUser.name;
      return {
        id: requestId,
        assetCode: asset.code,
        assetName: asset.name,
        quantity,
        unit: asset.unitType === 'KG' ? 'g' : 'unid.',
        requester: currentUser.name,
        run: currentUser.run,
        email: currentUser.email,
        school: currentUser.school,
        notes: notes.trim(),
        status: 'Solicitado',
        movementType: asset.returnable ? 'PRESTAMO' : 'PEDIDO',
        createdAt,
        returnDate: asset.returnable
          ? new Date(Date.now() + durationDays * 86400000).toISOString().slice(0, 10)
          : '',
        ownerRole: role,
        stockDeducted: false,
        history: [{ action: 'Solicitud registrada', actor, date: createdAt }],
      };
    });

    setData((current) => ({ ...current, orders: [...newOrders, ...current.orders] }));
    setCart([]);
    setNotes('');
    setCartOpen(false);
    setOrdersTab('orders');
    toast.success(`Se registraron ${newOrders.length} solicitud(es).`);
  };

  const updateCartQuantity = (code: string, value: number) => {
    setCart((current) => current.map((line) => line.code === code ? { ...line, quantity: value } : line));
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-linear-to-r from-cyan-700 to-sky-500 p-6 text-white shadow-lg md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/75">Catálogo CITT Stock</p>
            <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">Reserva tus materiales para taller</h1>
            <p className="mt-2 text-sm text-white/85">Selecciona lo que necesitas y retíralo presentando tu RUN.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setOrdersTab('catalog')}>Explorar catálogo</Button>
            <Button variant="secondary" onClick={() => setCartOpen(true)}>
              <ShoppingBag className="mr-1 h-4 w-4" /> Mi Solicitud ({cart.length})
            </Button>
            <Button variant="secondary" onClick={() => setOrdersTab('orders')}>Mis Pedidos ({myOrders.length})</Button>
          </div>
        </div>
      </section>

      {ordersTab === 'catalog' ? (
        <>
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar Arduino, equipo, ubicación..." className="h-11 pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <Button key={item.value} size="sm" variant={category === item.value ? 'default' : 'outline'} onClick={() => setCategory(item.value)}>
                  {item.label}
                </Button>
              ))}
            </div>
          </section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAssets.map((asset) => (
              <article key={asset.code} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111827]">
                <div className="flex h-36 items-center justify-center bg-linear-to-br from-sky-500/10 to-cyan-500/20 text-sky-600 dark:text-sky-400">
                  <Package className="h-14 w-14 stroke-[1.25]" />
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs font-bold text-sky-600">{asset.code}</p>
                      <h2 className="mt-1 font-bold">{asset.name}</h2>
                    </div>
                    <Badge variant="outline">{asset.category}</Badge>
                  </div>
                  <p className="min-h-10 text-xs leading-relaxed text-slate-500">{asset.description}</p>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                    <span className={asset.available > 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-500'}>
                      {asset.available} {asset.unitType === 'KG' ? 'kg' : 'unid.'} disponibles
                    </span>
                    <span className="text-slate-400">{asset.location}</span>
                  </div>
                  {asset.returnable && <p className="flex items-center gap-1 text-[11px] text-slate-500"><CalendarClock className="h-3.5 w-3.5" /> Préstamo con devolución</p>}
                  <Button className="w-full" disabled={asset.available <= 0} onClick={() => addToCart(asset.code)}>
                    <Plus className="mr-1 h-4 w-4" /> {asset.available > 0 ? 'Agregar a solicitud' : 'Sin stock'}
                  </Button>
                </div>
              </article>
            ))}
          </div>
          {!filteredAssets.length && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">No hay activos para esta búsqueda.</p>}
        </>
      ) : (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
          <h2 className="text-lg font-bold">Seguimiento de mis pedidos</h2>
          {!myOrders.length ? <p className="py-8 text-center text-sm text-slate-500">Aún no tienes pedidos activos.</p> : (
            <div className="space-y-3">
              {myOrders.map((order) => (
                <article key={order.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div><p className="font-mono text-xs font-bold text-sky-600">{order.id}</p><h3 className="mt-1 font-semibold">{order.assetName}</h3></div>
                    <Badge variant="outline" className={statusColor[order.status]}>{order.status}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{order.quantity} {order.unit} · {order.school} · {new Date(order.createdAt).toLocaleDateString('es-CL')}</p>
                  <p className="mt-1 text-xs text-slate-500">{order.history.map((event) => event.action).join(' → ')}</p>
                  {order.returnDate && <p className="mt-1 text-xs text-slate-500">Devolución prevista: {order.returnDate}</p>}
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Mi solicitud</DialogTitle>
            <DialogDescription>Confirma tus activos y registra el motivo de la solicitud.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {!cart.length && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900">Tu solicitud está vacía. Agrega activos desde el catálogo.</p>}
            {cart.map((line) => {
              const asset = data.assets.find((item) => item.code === line.code);
              if (!asset) return null;
              const max = asset.unitType === 'KG' ? Math.floor(asset.available * 1000) : asset.available;
              return (
                <div key={line.code} className="flex items-center gap-3 rounded-xl border p-3 dark:border-slate-700">
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{asset.name}</p><p className="text-xs text-slate-500">{asset.code} · Disponible: {asset.available} {asset.unitType === 'KG' ? 'kg' : 'unid.'}</p></div>
                  <Input className="w-24" type="number" min={asset.unitType === 'KG' ? 1 : 1} max={max} value={line.quantity} onChange={(event) => updateCartQuantity(line.code, Number(event.target.value))} aria-label={`Cantidad de ${asset.name}`} />
                  <Button variant="ghost" size="icon" aria-label={`Quitar ${asset.name}`} onClick={() => setCart((items) => items.filter((item) => item.code !== line.code))}><Trash2 className="h-4 w-4 text-rose-500" /></Button>
                </div>
              );
            })}
            {cart.some((line) => data.assets.find((asset) => asset.code === line.code)?.returnable) && (
              <label className="block text-sm font-medium">Duración de préstamo
                <select value={durationDays} onChange={(event) => setDurationDays(Number(event.target.value))} className="mt-1 block w-full rounded-lg border border-slate-200 bg-background p-2.5 text-sm dark:border-slate-700">
                  {[1, 2, 3, 4, 5, 7].map((days) => <option key={days} value={days}>{days} día(s)</option>)}
                </select>
              </label>
            )}
            <label className="block text-sm font-medium">Motivo / Taller o asignatura
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} required minLength={3} maxLength={300} rows={3} className="mt-1 block w-full rounded-lg border border-slate-200 bg-background p-2.5 text-sm dark:border-slate-700" />
            </label>
            <div className="flex justify-end gap-2 border-t pt-3">
              <Button variant="outline" onClick={() => setCartOpen(false)}>Seguir explorando</Button>
              <Button disabled={!cart.length} onClick={submitRequest}>Enviar pedido</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
