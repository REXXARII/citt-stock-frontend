'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

export default function ConfiguracionPage() {
  const [maxLoanDays, setMaxLoanDays] = useState(7);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalStockThreshold, setCriticalStockThreshold] = useState(2);
  const [strictSignature, setStrictSignature] = useState(true);
  const [campusName, setCampusName] = useState('CITT Campus Duoc UC - Sede San Bernardo');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Parámetros guardados correctamente');
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-sm font-bold text-slate-800 dark:text-white">
          Parametrización del Sistema
        </h2>
        <p className="text-xs text-slate-500">
          Ajustes de reglas operativas, alertas y configuración general de la sede
        </p>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Reglas de Negocio & Control Operativo
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Los cambios afectarán las validaciones de préstamos y reportes del pañol.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-800 dark:text-white">
                  1. Plazo Máximo de Préstamo (Días)
                </p>
                <p className="text-[11px] text-slate-400">
                  Límite estándar de días antes de clasificar al alumno en morosidad.
                </p>
              </div>
              <Input
                type="number"
                min={1}
                value={maxLoanDays}
                onChange={(e) => setMaxLoanDays(Number(e.target.value))}
                className="w-20 text-center font-bold h-8 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-800 dark:text-white">
                  2. Notificaciones Automáticas por Email
                </p>
                <p className="text-[11px] text-slate-400">
                  Avisos preventivos a correos institucionales antes del vencimiento.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-sky-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-800 dark:text-white">
                  3. Umbral de Stock Crítico
                </p>
                <p className="text-[11px] text-slate-400">
                  Cantidad mínima disponible para disparar la alerta roja de reposición.
                </p>
              </div>
              <Input
                type="number"
                min={0}
                value={criticalStockThreshold}
                onChange={(e) => setCriticalStockThreshold(Number(e.target.value))}
                className="w-20 text-center font-bold h-8 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-800 dark:text-white">
                  4. Modo Estricto de Firma Digital
                </p>
                <p className="text-[11px] text-slate-400">
                  Exigir obligatoriamente la firma en pantalla antes de completar la entrega.
                </p>
              </div>
              <input
                type="checkbox"
                checked={strictSignature}
                onChange={(e) => setStrictSignature(e.target.checked)}
                className="w-4 h-4 accent-sky-600 cursor-pointer"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-2">
              <div>
                <p className="font-bold text-slate-800 dark:text-white">
                  5. Identificación de la Sede / Pañol
                </p>
                <p className="text-[11px] text-slate-400">
                  Nombre institucional impreso en reportes y comprobantes de recepción.
                </p>
              </div>
              <Input
                type="text"
                value={campusName}
                onChange={(e) => setCampusName(e.target.value)}
                className="w-full sm:w-72 font-semibold h-8 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button type="submit" size="sm" className="text-xs h-9 bg-sky-600 hover:bg-sky-700 text-white font-semibold">
                <Save className="w-3.5 h-3.5 mr-1.5" /> Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}