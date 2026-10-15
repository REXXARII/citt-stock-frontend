'use client';

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

interface Member {
  rut: string;
  name: string;
  roleCareer: string;
  status: 'Al Día' | 'Préstamo Activo' | 'Amonestado / Mora';
  activeItems: string;
}

export default function MiembrosPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const members: Member[] = [
    { rut: '19.845.312-K', name: 'Matías Torres', roleCareer: 'Alumno - Ing. Informática', status: 'Al Día', activeItems: '1 Activo' },
    { rut: '16.234.981-2', name: 'Camila Vega', roleCareer: 'Docente - Depto Electricidad', status: 'Al Día', activeItems: '0 Activos' },
    { rut: '20.112.443-5', name: 'Esteban Soto', roleCareer: 'Alumno - Ing. Electrónica', status: 'Préstamo Activo', activeItems: '1 Activo' },
    { rut: '14.992.100-8', name: 'Javiera Parra', roleCareer: 'Investigador - Lab Prototipos', status: 'Al Día', activeItems: '2 Activos' },
    { rut: '18.765.432-1', name: 'Felipe Rojas', roleCareer: 'Alumno - Tesis Mecánica', status: 'Amonestado / Mora', activeItems: '1 Activo (Atrasado)' },
  ];

  const getStatusBadge = (status: Member['status']) => {
    if (status === 'Al Día') {
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px] font-semibold gap-1">
          <CheckCircle2 className="w-3 h-3" /> Al Día
        </Badge>
      );
    }
    if (status === 'Préstamo Activo') {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[10px] font-semibold gap-1">
          <Clock className="w-3 h-3" /> Préstamo Activo
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 text-[10px] font-semibold gap-1">
        <ShieldAlert className="w-3 h-3" /> Amonestado / Mora
      </Badge>
    );
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.roleCareer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por RUT, nombre o carrera..."
            className="pl-8 text-xs h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
        </div>
        <Button size="sm" className="text-xs h-9 bg-sky-600 hover:bg-sky-700 text-white font-semibold">
          <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Registrar Solicitante
        </Button>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <Table className="text-xs">
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
            <TableRow className="border-b border-slate-100 dark:border-slate-800">
              <TableHead className="p-3.5 font-semibold">RUT / ID</TableHead>
              <TableHead className="p-3.5 font-semibold">Nombre Completo</TableHead>
              <TableHead className="p-3.5 font-semibold">Rol / Carrera</TableHead>
              <TableHead className="p-3.5 font-semibold">Estado</TableHead>
              <TableHead className="p-3.5 font-semibold">Equipos Prestados</TableHead>
              <TableHead className="p-3.5 text-right font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredMembers.map((member) => (
              <TableRow key={member.rut} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 font-mono text-slate-500">{member.rut}</td>
                <td className="p-3.5 font-bold text-slate-800 dark:text-white">{member.name}</td>
                <td className="p-3.5 text-slate-500">{member.roleCareer}</td>
                <td className="p-3.5">{getStatusBadge(member.status)}</td>
                <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">{member.activeItems}</td>
                <td className="p-3.5 text-right">
                  <button className="text-sky-600 dark:text-sky-400 font-semibold hover:underline">
                    Ver Ficha
                  </button>
                </td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}