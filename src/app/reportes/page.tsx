'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, RotateCcw, Award, AlertOctagon, Activity } from 'lucide-react';

export default function ReportesPage() {
  const metrics = [
    {
      title: 'Rotación de Inventario',
      value: '78%',
      desc: 'Los activos de electrónica y prototipado registran la mayor movilidad mensual.',
      icon: RotateCcw,
    },
    {
      title: 'Tasa de Devolución a Tiempo',
      value: '92%',
      desc: 'Cumplimiento general de los plazos por parte de los alumnos de todas las escuelas.',
      icon: TrendingUp,
    },
    {
      title: 'Categoría Más Solicitada',
      value: 'Microcontroladores',
      desc: 'Arduino, ESP32 y sensores lideran las solicitudes en ventanilla.',
      icon: Award,
    },
    {
      title: 'Incidencia de Bajas',
      value: '< 1.5%',
      desc: 'Porcentaje de equipos dados de baja por deterioro irrecuperable en pañol.',
      icon: AlertOctagon,
    },
    {
      title: 'Carga de Trabajo OT',
      value: '48 hrs',
      desc: 'Tiempo promedio de resolución de mantenciones preventivas y correctivas.',
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            Analítica & Reportes de Inventario
          </h2>
          <p className="text-xs text-slate-500">
            Indicadores cuantitativos de trazabilidad para CITT Duoc UC San Bernardo
          </p>
        </div>
        <Button variant="outline" size="sm" className="text-xs h-9 border-slate-200">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Exportar Informe PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.title}
              className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm"
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    {metric.title}
                  </span>
                  <Icon className="w-4 h-4 text-sky-600" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  {metric.value}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {metric.desc}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}