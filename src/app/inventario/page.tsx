'use client';

import React, { useState } from 'react';
import { mockItems, mockCategories, mockLocations, mockUsers } from '@/lib/mockData';
import { Item, ItemStatus } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  QrCode,
  MapPin,
  Tag,
  AlertTriangle,
  Package,
  Layers,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export default function InventarioPage() {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Simulación de sesión: Administrador (Paz Constanza Morales Saavedra)
  const currentUser = mockUsers.find((u) => u.name.includes('Paz Constanza Morales')) || mockUsers[0];
  const isAdmin = currentUser.role === 'Administrador';

  const getCategoryName = (categoryId: string) => {
    return mockCategories.find((c) => c.id === categoryId)?.name || 'General';
  };

  const getLocationLabel = (locationId: string) => {
    if (locationId === 'loc-03') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          Sin Casillero / Sin ubicación fija
        </span>
      );
    }
    const loc = mockLocations.find((l) => l.id === locationId);
    return (
      <span className="inline-flex items-center gap-1 text-slate-700 text-sm">
        <MapPin className="w-3.5 h-3.5 text-sky-500" />
        {loc ? `${loc.code} - ${loc.name}` : locationId}
      </span>
    );
  };

  const getStatusBadge = (status: ItemStatus) => {
    const config: Record<ItemStatus, { label: string; className: string }> = {
      Operativo: {
        label: 'Operativo',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      },
      'En Mantención': {
        label: 'En Mantención',
        className: 'bg-sky-50 text-sky-700 border-sky-200',
      },
      'En Reparación': {
        label: 'En Reparación',
        className: 'bg-orange-50 text-orange-700 border-orange-200',
      },
      'De Baja': {
        label: 'De Baja',
        className: 'bg-rose-50 text-rose-700 border-rose-200',
      },
      Desaparecido: {
        label: 'Desaparecido',
        className: 'bg-slate-100 text-slate-700 border-slate-300',
      },
    };

    const current = config[status] || config['Operativo'];

    return (
      <Badge variant="outline" className={`${current.className} font-medium`}>
        {current.label}
      </Badge>
    );
  };

  // Formato estricto para códigos autogenerados CITT
  const resolveItemQR = (item: Item): string => {
    if (item.qr_code) return item.qr_code;
    const catName = getCategoryName(item.category_id).toLowerCase();
    let prefix = 'EQ-CITT-';

    if (catName.includes('mobiliario')) prefix = 'IM-CITT-';
    else if (catName.includes('3d') || catName.includes('impresion')) prefix = '3D-CITT-';
    else if (catName.includes('taller')) prefix = 'TA-CITT-';

    return `${prefix}${item.id.replace(/\D/g, '').padStart(4, '0')}`;
  };

  const handleRowClick = (item: Item) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Catálogo de Activos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión de inventario físico y consumibles del CITT Duoc UC San Bernardo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-sky-100 text-sky-800 border-sky-200 px-3 py-1">
            Rol Activo: {currentUser.role}
          </Badge>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Package className="w-4 h-4 text-sky-600" />
            Equipamiento Registrado
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Haz clic en cualquier registro para visualizar la ficha técnica y código QR.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-200">
                <TableHead className="font-semibold text-slate-700 w-[120px]">ID</TableHead>
                <TableHead className="font-semibold text-slate-700">Nombre del Activo</TableHead>
                <TableHead className="font-semibold text-slate-700">Categoría</TableHead>
                <TableHead className="font-semibold text-slate-700">Ubicación</TableHead>
                <TableHead className="font-semibold text-slate-700">Stock Actual</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockItems.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() => handleRowClick(item)}
                  className="cursor-pointer hover:bg-sky-50/50 transition-colors border-slate-100"
                >
                  <TableCell className="font-mono text-xs text-slate-500">{item.id}</TableCell>
                  <TableCell className="font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      {item.name}
                      <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      <Tag className="w-3 h-3 text-slate-400" />
                      {getCategoryName(item.category_id)}
                    </span>
                  </TableCell>
                  <TableCell>{getLocationLabel(item.location_id)}</TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {item.stock} <span className="text-xs text-slate-400">{item.unit}</span>
                  </TableCell>
                  <TableCell className="text-right">{getStatusBadge(item.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Ficha de Activo */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg bg-white border-slate-200 sm:rounded-xl">
          <DialogHeader>
            <div className="flex items-center justify-between pr-4">
              <span className="text-xs font-mono bg-sky-50 text-sky-700 px-2.5 py-1 rounded-md font-semibold border border-sky-100">
                {selectedItem?.id}
              </span>
              {selectedItem && getStatusBadge(selectedItem.status)}
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 mt-2">
              {selectedItem?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Ficha de trazabilidad y control de inventario CITT
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-5 pt-2">
              {/* Tarjeta del Código QR Oficial */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center">
                  <QrCode className="w-24 h-24 text-slate-800" strokeWidth={1.5} />
                  <span className="mt-2 text-xs font-mono font-bold text-sky-800 tracking-wider">
                    {resolveItemQR(selectedItem)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Etiqueta térmica oficial de verificación en ventanilla
                </p>
              </div>

              {/* Atributos y detalles */}
              <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50/50 p-3.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-slate-400" /> Categoría
                  </span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {getCategoryName(selectedItem.category_id)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Package className="w-3 h-3 text-slate-400" /> Stock y Formato
                  </span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {selectedItem.stock} {selectedItem.unit}
                  </p>
                </div>
                <div className="col-span-2 border-t border-slate-200/60 pt-2.5">
                  <span className="text-xs text-slate-500 block">Ubicación Actual</span>
                  <div className="mt-1">{getLocationLabel(selectedItem.location_id)}</div>
                </div>
              </div>

              {/* Botón de acción destructiva exclusivo para Administrador */}
              {isAdmin && (
                <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-700 text-white font-medium flex items-center gap-1.5 shadow-sm"
                    onClick={() => {
                      alert(`Dar de baja ejecutado para: ${selectedItem.name}`);
                      setIsDialogOpen(false);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Dar de baja el activo
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