'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, Search, ShieldAlert, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAppState, type MemberRecord } from '@/components/app-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const emptyMember = { name: '', email: '', run: '', role: 'Alumno', school: 'Informática' };

export default function MiembrosPage() {
  const { role, data, setData } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [detail, setDetail] = useState<MemberRecord | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyMember);

  const filteredMembers = useMemo(() => data.members.filter((member) =>
    `${member.name} ${member.run} ${member.email} ${member.school}`.toLowerCase().includes(searchTerm.toLowerCase()),
  ), [data.members, searchTerm]);

  const openForm = (member?: MemberRecord) => {
    if (role !== 'ADMIN') {
      toast.error('Solo el administrador puede registrar o editar miembros.');
      return;
    }
    setEditingId(member?.id ?? null);
    setForm(member
      ? { name: member.name, email: member.email, run: member.run, role: member.role, school: member.school }
      : emptyMember);
    setFormOpen(true);
  };

  const saveMember = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (role !== 'ADMIN') return;
    const normalizedRun = form.run.trim().toLowerCase();
    const email = form.email.trim().toLowerCase();
    const duplicate = data.members.some((member) => member.id !== editingId &&
      (member.run.toLowerCase() === normalizedRun || member.email.toLowerCase() === email));
    if (duplicate) {
      toast.error('Ya existe un miembro con ese RUN o correo.');
      return;
    }
    if (editingId) {
      setData((current) => ({
        ...current,
        members: current.members.map((member) => member.id === editingId
          ? { ...member, ...form, run: form.run.trim(), email }
          : member),
      }));
      toast.success('Miembro actualizado.');
    } else {
      const member: MemberRecord = {
        id: `M-${Date.now()}`,
        ...form,
        name: form.name.trim(),
        email,
        run: form.run.trim(),
        blocked: false,
        loans: 0,
        overdueDays: 0,
      };
      setData((current) => ({ ...current, members: [member, ...current.members] }));
      toast.success('Miembro registrado.');
    }
    setFormOpen(false);
  };

  const toggleBlocked = (member: MemberRecord) => {
    if (role !== 'ADMIN') return;
    setData((current) => ({
      ...current,
      members: current.members.map((item) => item.id === member.id ? { ...item, blocked: !item.blocked } : item),
    }));
    toast.success(member.blocked ? 'Miembro desbloqueado.' : 'Miembro bloqueado.');
  };

  const roleOptions = ['Alumno', 'Alumno Líder', 'Docente', 'Administrador'];
  const schools = ['Construcción', 'Mecánica', 'Administración', 'Informática', 'Salud', 'Turismo', 'Naturaleza'];

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><h1 className="text-2xl font-bold">Miembros &amp; Solicitantes</h1><p className="mt-1 text-sm text-slate-500">Directorio institucional de usuarios, alumnos y docentes autorizados.</p></div>
        {role === 'ADMIN' && <Button onClick={() => openForm()}><UserPlus className="mr-1 h-4 w-4" /> Invitar / Registrar Miembro</Button>}
      </div>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar usuario por nombre, RUN, correo o escuela..." className="pl-9" /></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="border-b bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900/60"><tr>{['Usuario', 'Correo', 'RUN / Identificador', 'Rol', 'Escuela / Área', 'Estado', 'Préstamos', 'Acción'].map((label) => <th key={label} className="p-3">{label}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="p-3 font-semibold">{member.name}</td><td className="p-3 text-slate-500">{member.email}</td><td className="p-3 font-mono">{member.run}</td><td className="p-3"><Badge variant="outline">{member.role}</Badge></td><td className="p-3 text-slate-500">{member.school}</td>
                  <td className="p-3">{member.blocked
                    ? <Badge variant="outline" className="border-rose-200 text-rose-600"><ShieldAlert className="mr-1 h-3 w-3" /> Bloqueado ({member.overdueDays}d)</Badge>
                    : <Badge variant="outline" className="border-emerald-200 text-emerald-600"><CheckCircle2 className="mr-1 h-3 w-3" /> Habilitado</Badge>}</td>
                  <td className="p-3">{member.loans} activo{member.loans === 1 ? '' : 's'}</td>
                  <td className="p-3"><div className="flex gap-1.5"><Button size="sm" variant="outline" onClick={() => setDetail(member)}>Ficha</Button>{role === 'ADMIN' && <Button size="sm" variant="outline" onClick={() => openForm(member)}>Editar</Button>}{role === 'ADMIN' && <Button size="sm" variant={member.blocked ? 'secondary' : 'destructive'} onClick={() => toggleBlocked(member)}>{member.blocked ? 'Desbloquear' : 'Bloquear'}</Button>}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredMembers.length && <p className="py-8 text-center text-sm text-slate-500">No se encontraron miembros para esa búsqueda.</p>}
        </div>
      </section>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? 'Editar miembro' : 'Registrar miembro'}</DialogTitle><DialogDescription>Completa los datos de la persona autorizada.</DialogDescription></DialogHeader>
          <form onSubmit={saveMember} className="space-y-3">
            <label className="block text-sm font-medium">Nombre<Input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label className="block text-sm font-medium">Correo<Input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <label className="block text-sm font-medium">RUN<Input required pattern="\d{1,2}\.\d{3}\.\d{3}-[\dkK]" placeholder="20.123.456-K" value={form.run} onChange={(event) => setForm({ ...form, run: event.target.value })} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">Rol<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="mt-1 block w-full rounded-lg border bg-background p-2.5 dark:border-slate-700">{roleOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="block text-sm font-medium">Escuela<select value={form.school} onChange={(event) => setForm({ ...form, school: event.target.value })} className="mt-1 block w-full rounded-lg border bg-background p-2.5 dark:border-slate-700">{schools.map((item) => <option key={item}>{item}</option>)}</select></label>
            </div>
            <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button><Button type="submit">Guardar</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(detail)} onOpenChange={(open) => { if (!open) setDetail(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-sky-600" />{detail?.name}</DialogTitle><DialogDescription>Ficha institucional del miembro</DialogDescription></DialogHeader>
          {detail && <div className="space-y-3 text-sm"><p><span className="text-xs text-slate-500">Correo</span><strong className="block">{detail.email}</strong></p><p><span className="text-xs text-slate-500">RUN · Rol</span><strong className="block">{detail.run} · {detail.role}</strong></p><p><span className="text-xs text-slate-500">Escuela · Préstamos activos</span><strong className="block">{detail.school} · {detail.loans}</strong></p><p className="flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3.5 w-3.5" />{detail.blocked ? `Bloqueado por ${detail.overdueDays} días de atraso` : 'Cuenta habilitada / al día'}</p>{role === 'ADMIN' && <Button className="w-full" variant="outline" onClick={() => { setDetail(null); openForm(detail); }}>Editar miembro</Button>}</div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
