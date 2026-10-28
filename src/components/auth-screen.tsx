'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import type { SessionProfile, SessionRole } from '@/components/app-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login as loginWithApi, registerAccount } from '@/lib/auth-api';

interface AuthScreenProps {
  open: boolean;
  onAuthenticate: (profile: SessionProfile, role: SessionRole, accessToken: string) => void;
  onRegister: (profile: SessionProfile) => void;
}

export function AuthScreen({ open, onAuthenticate, onRegister }: AuthScreenProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [run, setRun] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('Construcción');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const session = await loginWithApi(run, password);
      setRun('');
      setPassword('');
      onAuthenticate(session.profile, session.role, session.accessToken);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const register = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const session = await registerAccount({ name, email, run, school, password });
      setRun('');
      setPassword('');
      setName('');
      setEmail('');
      onRegister(session.profile);
      onAuthenticate(session.profile, session.role, session.accessToken);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo crear la cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-100 p-4 dark:bg-[#070b14]">
      <section className="my-auto w-full max-w-lg space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#111827]">
        <div className="flex items-center gap-3">
          <Image src="/citt-logo.png" alt="CITT Duoc UC" width={447} height={447} className="h-11 w-11 shrink-0 rounded-full object-cover" />
          <div>
            <h1 className="text-lg font-extrabold">Bienvenido a CITT Stock</h1>
            <p className="mt-1 text-xs text-slate-500">Inicia sesión o crea una cuenta.</p>
          </div>
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
          {tab === 'register' && <p className="text-[11px] text-slate-500">Usa al menos 8 caracteres. La cuenta se guardará en el sistema.</p>}
          {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Conectando...' : tab === 'login' ? 'Ingresar' : 'Crear cuenta y continuar'}</Button>
        </form>

        <div className="rounded-xl bg-sky-500/10 p-3 text-xs leading-relaxed text-sky-800 dark:text-sky-200">
          <p className="font-bold">Acceso de demostración rápido</p>
          <div className="mt-1 flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => { setTab('login'); setRun('16.321.654-8'); setPassword('citt2026'); setError(''); }}
              className="rounded-lg bg-sky-500/20 px-2 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-500/30 dark:text-sky-300"
            >
              Admin: 16.321.654-8
            </button>
            <button
              type="button"
              onClick={() => { setTab('login'); setRun('19.882.112-k'); setPassword('citt2026'); setError(''); }}
              className="rounded-lg bg-sky-500/20 px-2 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-500/30 dark:text-sky-300"
            >
              Ayudante: 19.882.112-k
            </button>
            <button
              type="button"
              onClick={() => { setTab('login'); setRun('18.765.432-1'); setPassword('citt2026'); setError(''); }}
              className="rounded-lg bg-sky-500/20 px-2 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-500/30 dark:text-sky-300"
            >
              Global: 18.765.432-1
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">Contraseña demo: <span className="font-mono font-bold text-sky-700 dark:text-sky-300">citt2026</span></p>
        </div>

        <p className="text-center text-[10px] text-slate-400">Autenticación validada con CITT Stock.</p>
      </section>
    </div>
  );
}
