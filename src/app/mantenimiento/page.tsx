'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Wrench, Clock, AlertCircle } from 'lucide-react';

interface OT {
  code: string;
  title: string;
  description: string;
  status: 'En Proceso' | 'Pendiente' | 'Completada' | 'Urgente';
  type: 'Preventivo' | 'Correctivo';
}

export default function MantenimientoPage() {
  const workOrders: OT[] = [
    {
      code: 'OT-2026-001',
      title: 'Fuente Poder Regulada 30V',
      description: 'Calibración de voltaje de salida y cambio de fusible interno.',
      status: 'En Proceso',
      type: 'Correctivo',
    },
    {
      code: 'OT-2026-002',
      title: 'Impresora 3D Creality CR-10',
      description: 'Nivelación de cama caliente y sustitución de boquilla extrusora.',
      status: 'Pendiente',
      type: 'Preventivo',
    },
    {
      code: 'OT-2026-003',
      title: 'Osciloscopio Siglent 100MHz',
      description: 'Prueba de respuesta en frecuencia y actualización de firmware.',
      status: 'Completada',
      type: 'Preventivo',
    },
    {
      code: 'OT-2026-004',
      title: 'Generador de Funciones DDS',
      description: 'Reparación de conector BNC frontal dañado por golpe accidental.',
      status: 'Urgente',
      type: 'Correctivo',
    },
    {
      code: 'OT-2026-005',
      title: 'Taladro de Banco Mini Proxxon',
      description: 'Cambio de correa de transmisión y lubricación de eje principal.',
      status: 'En Proceso',
      type: 'Preventivo',
    },
  ];

  const getStatusBadge = (status: OT['status']) => {
    const config = {
      'En Proceso': 'bg-amber-50 text-amber-600 border-amber-200',
      Pendiente: 'bg-blue-50 text-blue-600 border-blue-200',
      Completada: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      Urgente: 'bg-rose-50 text-rose-600 border-rose-200',
    };
    return (
      <Badge variant="outline" className={`text-[10px] font-bold ${config[status]}`}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            Órdenes de Trabajo (OT) & Mantención
          </h2>
          <p className="text-xs text-slate-500">
            Control de mantenimiento preventivo y productivo/correctivo del pañol CITT
          </p>
        </div>
        <Button size="sm" className="text-xs h-9 bg-sky-600 hover:bg-sky-700 text-white font-semibold">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Crear Orden de Trabajo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workOrders.map((ot) => (
          <Card
            key={ot.code}
            className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm hover:border-sky-300 transition-colors"
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs text-sky-600 dark:text-sky-400 font-bold">
                  {ot.code}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold">{ot.type}</span>
                  {getStatusBadge(ot.status)}
                </div>
              </div>
              <h4 className="font-bold text-xs text-slate-800 dark:text-white">
                {ot.title}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {ot.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}