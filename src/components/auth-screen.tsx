'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import type { MemberRecord, SessionProfile, SessionRole } from '@/components/app-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AuthScreenProps {
  members: MemberRecord[];
  open: boolean;
  onAuthenticate: (profile: SessionProfile, role: SessionRole) => void;
  onRegister: (profile: SessionProfile) => void;
}

interface RegisteredAccount {
  profile: SessionProfile;
  password: string;
}

const demoAccounts: { profile: SessionProfile; role: SessionRole; password: string }[] = [
  {
    profile: { name: 'Paz Constanza Morales Saavedra', email: 'pc.morales@profesor.duoc.cl', run: '16.321.654-8', role: 'Administrador', school: 'Administración' },
    role: 'ADMIN',
    password: 'citt2026',
  },
  {
    profile: { name: 'Rocío Torres', email: 'rocio.torres@duocuc.cl', run: '19.882.112-k', role: 'Alumno Líder', school: 'Informática' },
    role: 'AYUDANTE',
    password: 'citt2026',
  },
  {
    profile: { name: 'Camila Soto', email: 'camila.soto@duocuc.cl', run: '18.765.432-1', role: 'Usuario Global', school: 'Administración' },
    role: 'GLOBAL',
    password: 'citt2026',
  },
];

const normalizeRun = (run: string) => run.replace(/[.\-\s]/g, '').toUpperCase();

export function AuthScreen({ members, open, onAuthenticate, onRegister }: AuthScreenProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredAccount[]>([]);
  const [run, setRun] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('Construcción');
  const [error, setError] = useState('');

  if (!open) return null;

  const login = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const normalizedRun = normalizeRun(run);
    const registered = registeredAccounts.find((account) =>
      normalizeRun(account.profile.run) === normalizedRun && account.password === password,
    );
    if (registered) {
      setRun('');
      setPassword('');
      onAuthenticate(registered.profile, 'GLOBAL');
      return;
    }

    const demoAccount = demoAccounts.find((account) =>
      normalizeRun(account.profile.run) === normalizedRun && account.password === password,
    );
    if (!demoAccount) {
      setError('RUN o contraseña incorrectos. Revisa tus datos e inténtalo nuevamente.');
      return;
    }

    setRun('');
    setPassword('');
    onAuthenticate(demoAccount.profile, demoAccount.role);
  };

  const register = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const normalizedRun = normalizeRun(run);
    if (!/^\d{7,8}[0-9K]$/.test(normalizedRun)) {
      setError('Ingresa el RUN con formato xx.xxx.xxx-x.');
      return;
    }
    if ([...members, ...registeredAccounts.map(({ profile }) => profile)]
      .some((member) => normalizeRun(member.run) === normalizedRun)) {
      setError('Ya existe una cuenta registrada con ese RUN.');
      return;
    }

    const profile: SessionProfile = {
      name: name.trim(),
      email: email.trim(),
      run: run.trim(),
      role: 'Usuario Global',
      school,
    };
    setRegisteredAccounts((current) => [...current, { profile, password }]);
    setRun('');
    setPassword('');
    setName('');
    setEmail('');
    onRegister(profile);
    onAuthenticate(profile, 'GLOBAL');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-100 p-4 dark:bg-[#070b14]">
      <section className="my-auto w-full max-w-lg space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#111827]">
        <div className="flex items-center gap-3">
          <Image src="/citt-logo.png" alt="" width={447} height={447} className="h-11 w-11 shrink-0 rounded-full object-cover" />
          <div><h1 className="text-lg font-extrabold">Bienvenido a CITT Stock</h1><p className="mt-1 text-xs text-slate-500">Inicia sesión o crea una cuenta de demostración.</p></div>
        </div>
        <div className="flex gap-2">
          <Button type="button" className="flex-1" variant={tab === 'login' ? 'default' : 'secondary'} onClick={() => { setTab('login'); setError(''); }}>Iniciar sesión</Button>
          <Button type="button" className="flex-1" variant={tab === 'register' ? 'default' : 'secondary'} onClick={() => { setTab('register'); setError(''); }}>Crear cuenta</Button>
        </div>

        <form onSubmit={tab === 'login' ? login : register} className="space-y-3">
          {tab === 'register' && (
            <>
              <label className="block text-xs font-semibold">Nombre<Input required value={name} onChange={(event) => setName(event.target.value)} /></label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold">RUN<Input required pattern="\d{1,2}\.\d{3}\.\d{3}-[\dkK]" placeholder="20.123.456-K" value={run} onChange={(event) => setRun(event.target.value)} /></label>
                <label className="block text-xs font-semibold">Correo<Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
              </div>
              <label className="block text-xs font-semibold">Escuela<select required value={school} onChange={(event) => setSchool(event.target.value)} className="mt-1 block h-11 w-full rounded-xl border border-slate-200 bg-background px-3 text-sm dark:border-slate-700">{['Construcción', 'Mecánica', 'Administración', 'Informática', 'Salud', 'Turismo', 'Naturaleza'].map((option) => <option key={option}>{option}</option>)}</select></label>
            </>
          )}
          {tab === 'login' && (
            <label className="block text-xs font-semibold">RUN<Input required pattern="\d{1,2}\.\d{3}\.\d{3}-[\dkK]" placeholder="20.123.456-K" value={run} onChange={(event) => setRun(event.target.value)} /></label>
          )}
          <label className="block text-xs font-semibold">Contraseña<Input type="password" required minLength={tab === 'register' ? 8 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {tab === 'register' && <p className="text-[11px] text-slate-500">Usa al menos 8 caracteres. La cuenta se conservará durante esta sesión de demostración.</p>}
          {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
          <Button type="submit" className="w-full">{tab === 'login' ? 'Ingresar' : 'Crear cuenta y continuar'}</Button>
        </form>

        <p className="text-center text-[10px] text-slate-400">Autenticación local de demostración; no reemplaza un servicio de acceso real.</p>
      </section>
    </div>
  );
}
