'use client';

import React, { useState } from 'react';
import { mockItems, mockCategories, mockLocations, mockUsers } from '@/lib/mockData';
import { Item, ItemStatus } from '@/types';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  QrCode,
  MapPin,
  AlertTriangle,
  Download,
  Eye,
  Trash2,
  Search,
} from 'lucide-react';
import Link from 'next/link';

const ITEM_STATUS_LABELS: Record<string, ItemStatus> = {
  OPERATIVE: 'Operativo',
  EN_MANTENCION: 'En Mantención',
  EN_REPARACION: 'En Reparación',
  DE_BAJA: 'De Baja',
  DESAPARECIDO: 'Desaparecido',
};

export default function InventarioPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Administrador por defecto
  const currentUser = mockUsers.data.find((u) => u.name.includes('Paz Constanza Morales')) || mockUsers.data[0];
  const isAdmin = currentUser?.role === 'ADMINISTRADOR';

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

  const getCategoryName = (categoryId: string) => {
    return mockCategories.data.find((c) => c.id === categoryId)?.name || 'General';
  };

  const getLocationLabel = (locationId: string) => {
    if (locationId === 'loc-03') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          Sin Casillero / Sin ubicación fija
        </span>
      );
    }
    const loc = mockLocations.data.find((l) => l.id === locationId);
    return (
      <span className="inline-flex items-center gap-1 text-slate-600 text-xs">
        <MapPin className="w-3.5 h-3.5 text-sky-500" />
        {loc ? loc.name : locationId}
      </span>
    );
  };

  const getStatusBadge = (status: ItemStatus) => {
    const config: Record<ItemStatus, { label: string; className: string }> = {
      Operativo: { label: 'Operativo', className: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
      'En Mantención': { label: 'En Mantención', className: 'bg-sky-50 text-sky-600 border-sky-200' },
      'En Reparación': { label: 'En Reparación', className: 'bg-orange-50 text-orange-600 border-orange-200' },
      'De Baja': { label: 'De Baja', className: 'bg-rose-50 text-rose-600 border-rose-200' },
      Desaparecido: { label: 'Desaparecido', className: 'bg-slate-100 text-slate-700 border-slate-300' },
    };
    const current = config[status] || config.Operativo;
    return (
      <Badge variant="outline" className={`${current.className} text-[10px] font-semibold px-2 py-0.5`}>
        {current.label}
      </Badge>
    );
  };

  const resolveItemQR = (item: Item): string => {
    if (item.qr_code) return item.qr_code;
    const catName = getCategoryName(item.category_id).toLowerCase();
    let prefix = 'EQ-CITT-';
    if (catName.includes('mobiliario')) prefix = 'IM-CITT-';
    else if (catName.includes('3d') || catName.includes('impresion')) prefix = '3D-CITT-';
    else if (catName.includes('taller')) prefix = 'TA-CITT-';
    return `${prefix}${item.id.replace(/\D/g, '').padStart(4, '0')}`;
  };

  const filteredItems = items.filter((item) => {
    const search = searchTerm.toLowerCase();
    const cat = getCategoryName(item.category_id).toLowerCase();
    return (
      item.name.toLowerCase().includes(search) ||
      item.id.toLowerCase().includes(search) ||
      cat.includes(search)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, nombre o categoría..."
            className="pl-8 text-xs h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-9 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            onClick={() => alert('Exportando inventario_citt.csv...')}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Exportar CSV
          </Button>
          <Link href="/movimientos">
            <Button size="sm" className="text-xs h-9 bg-sky-600 hover:bg-sky-700 text-white font-semibold">
              Nuevo Movimiento
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <Table className="text-xs">
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
            <TableRow className="border-b border-slate-100 dark:border-slate-800">
              <TableHead className="p-3.5 font-semibold">Código QR</TableHead>
              <TableHead className="p-3.5 font-semibold">Nombre Activo</TableHead>
              <TableHead className="p-3.5 font-semibold">Categoría</TableHead>
              <TableHead className="p-3.5 font-semibold">Ubicación</TableHead>
              <TableHead className="p-3.5 font-semibold">Stock Disponible</TableHead>
              <TableHead className="p-3.5 font-semibold">Estado</TableHead>
              <TableHead className="p-3.5 text-right font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredItems.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="p-3.5 font-mono text-sky-600 font-semibold">{resolveItemQR(item)}</td>
                <td className="p-3.5 font-bold text-slate-800 dark:text-white">{item.name}</td>
                <td className="p-3.5 text-slate-500">{getCategoryName(item.category_id)}</td>
                <td className="p-3.5">{getLocationLabel(item.location_id)}</td>
                <td className="p-3.5 font-semibold text-emerald-600">
                  {item.stock} {item.unit}
                </td>
                <td className="p-3.5">{getStatusBadge(item.status)}</td>
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setIsDialogOpen(true);
                      }}
                      className="text-slate-400 hover:text-slate-700 transition"
                      title="Ver Ficha"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <Link
                      href="/movimientos"
                      className="text-sky-600 font-semibold hover:underline text-xs"
                    >
                      Prestar
                    </Link>
                  </div>
                </td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200 rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <div className="flex justify-between items-center pr-2">
              <span className="font-mono text-sky-600 text-xs font-bold">
                {selectedItem && resolveItemQR(selectedItem)}
              </span>
              {selectedItem && getStatusBadge(selectedItem.status)}
            </div>
            <DialogTitle className="text-base font-bold text-slate-900 mt-1">
              {selectedItem?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Ficha oficial del equipo CITT Duoc UC
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center">
                <QrCode className="w-20 h-20 text-slate-800 mb-1" strokeWidth={1.5} />
                <span className="text-[11px] font-mono font-bold text-slate-600 tracking-wider">
                  {resolveItemQR(selectedItem)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Categoría</span>
                  <p className="font-semibold text-slate-700">{getCategoryName(selectedItem.category_id)}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Stock Actual</span>
                  <p className="font-bold text-sky-600">{selectedItem.stock} {selectedItem.unit}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Ubicación</span>
                  <div className="mt-0.5">{getLocationLabel(selectedItem.location_id)}</div>
                </div>
              </div>

              {isAdmin && (
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
                    onClick={() => {
                      alert(`Activo ${selectedItem.name} dado de baja`);
                      setIsDialogOpen(false);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Dar de baja
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}