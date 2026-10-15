'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Box,
  ArrowUpRight,
  AlertTriangle,
  Wrench,
  ArrowRight,
  FileText,
} from 'lucide-react';

export default function DashboardPage() {
  const kpis = [
    {
      label: 'Total Ítems',
      value: '1,248',
      icon: Box,
      bg: 'bg-blue-50 dark:bg-blue-500/10 text-sky-600 dark:text-sky-400',
    },
    {
      label: 'En Préstamo',
      value: '42',
      icon: ArrowUpRight,
      bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Stock Crítico',
      value: '8',
      icon: AlertTriangle,
      bg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
    {
      label: 'En Mantención',
      value: '5',
      icon: Wrench,
      bg: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
  ];

  const recentMovements = [
    {
      asset: 'Arduino Mega 2560 #04',
      applicant: 'Matías Torres (Alumno)',
      type: 'Préstamo',
      date: 'Hoy, 10:15 AM',
      badgeColor: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      asset: 'Cautín Weller 60W',
      applicant: 'Camila Vega (Docente)',
      type: 'Devolución',
      date: 'Hoy, 09:30 AM',
      badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      asset: 'Multímetro Digital Fluke',
      applicant: 'Esteban Soto (Alumno)',
      type: 'Préstamo',
      date: 'Ayer, 16:45 PM',
      badgeColor: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      asset: 'Kit Sensores IoT ESP32',
      applicant: 'Laboratorio Redes (Pañol)',
      type: 'Recepción',
      date: 'Ayer, 14:00 PM',
      badgeColor: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      asset: 'Raspberry Pi 4 Model B',
      applicant: 'Javiera Parra (Investigación)',
      type: 'Baja',
      date: '30/08/2026',
      badgeColor: 'bg-rose-50 text-rose-600 border-rose-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.label}
              className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm"
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${kpi.bg}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {kpi.label}
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {kpi.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabla de Últimos Movimientos */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
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
              {recentMovements.map((mov, idx) => (
                <tr
                  key={idx}
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}