'use client';

import React from 'react';
import { AlertTriangle, Clock, Wrench, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AlertasPage() {
  const alerts = [
    {
      icon: AlertTriangle,
      color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-800',
      btnColor: 'bg-rose-600 hover:bg-rose-700',
      title: 'Stock Crítico',
      desc: 'Raspberry Pi 4 Model B tiene 0 unidades disponibles en pañol.',
      btnText: 'Solicitar',
    },
    {
      icon: Clock,
      color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-800',
      btnColor: 'bg-amber-600 hover:bg-amber-700',
      title: 'Préstamo Vencido',
      desc: 'El alumno Felipe Rojas excede el plazo máximo fijado con Impresora 3D.',
      btnText: 'Notificar',
    },
    {
      icon: Wrench,
      color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-800',
      btnColor: 'bg-blue-600 hover:bg-blue-700',
      title: 'Mantención Programada',
      desc: 'Extractor de humos principal requiere revisión mensual preventiva.',
      btnText: 'Ver OT',
    },
    {
      icon: Info,
      color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-800',
      btnColor: 'bg-purple-600 hover:bg-purple-700',
      title: 'Auditoría Semestral',
      desc: 'Se aproxima el inventario general semestral de componentes pasivos.',
      btnText: 'Detalles',
    },
    {
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700',
      title: 'Sincronización de Trazabilidad',
      desc: 'CITT Stock sincronizado y respaldado con el servidor central.',
      btnText: 'Ok',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-800 dark:text-white">
          Panel Central de Alertas Operativas
        </h2>
        <p className="text-xs text-slate-500">
          Notificaciones y eventos críticos que requieren intervención del administrador o líderes
        </p>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, idx) => {
          const Icon = alert.icon;
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${alert.color}`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>
                  <strong>{alert.title}:</strong> {alert.desc}
                </span>
              </div>
              <Button size="sm" className={`text-[10px] h-7 px-3 text-white font-bold ${alert.btnColor}`}>
                {alert.btnText}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}