'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/components/theme-provider';
import { AuthScreen } from '@/components/auth-screen';
import {
  Bell,
  ClipboardCheck,
  LayoutGrid,
  LogOut,
  Menu,
  Moon,
  Package,
  PieChart,
  Repeat,
  Settings,
  ShoppingBag,
  Sun,
  Users,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppState, type SessionProfile, type SessionRole } from '@/components/app-state';

const navigation = [
  { label: 'Dashboard / Panel', href: '/', icon: LayoutGrid, role: 'staff' },
  { label: 'Catálogo de Activos', href: '/inventario', icon: Package, role: 'staff' },
  { label: 'Movimientos / Historial', href: '/movimientos', icon: Repeat, role: 'staff' },
  { label: 'Mantenimiento (OT)', href: '/mantenimiento', icon: Wrench, role: 'staff' },
  { label: 'Pedidos / Catálogo', href: '/pedidos', icon: ShoppingBag, role: 'all' },
  { label: 'Gestión de Pedidos', href: '/gestion-pedidos', icon: ClipboardCheck, role: 'staff' },
  { label: 'Miembros & Solicitantes', href: '/miembros', icon: Users, role: 'staff' },
  { label: 'Alertas', href: '/alertas', icon: Bell, role: 'staff' },
  { label: 'Reportes & Analítica', href: '/reportes', icon: PieChart, role: 'staff' },
  { label: 'Parametrización', href: '/configuracion', icon: Settings, role: 'admin' },
];

const roleLabels: Record<SessionRole, string> = {
  ADMIN: 'Acceso Total',
  AYUDANTE: 'Alumno Ayudante',
  GLOBAL: 'Alumno Global',
};

const authStorageKey = 'citt-stock-frontend-session';

function isStoredSession(value: unknown): value is { profile: SessionProfile; role: SessionRole } {
  if (!value || typeof value !== 'object') return false;
  const session = value as { profile?: unknown; role?: unknown };
  if (!session.profile || typeof session.profile !== 'object') return false;
  if (!['ADMIN', 'AYUDANTE', 'GLOBAL'].includes(String(session.role))) return false;
  const profile = session.profile as Record<string, unknown>;
  return ['name', 'email', 'run', 'role', 'school'].every((field) => typeof profile[field] === 'string');
}

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { role, setRole, currentUser, setSessionUser, data, setData } = useAppState();
  const [authenticated, setAuthenticated] = useState(false);
  const [authOpen, setAuthOpen] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    try {
      const savedSession = window.sessionStorage.getItem(authStorageKey);
      if (savedSession) {
        const parsed: unknown = JSON.parse(savedSession);
        if (!isStoredSession(parsed)) throw new Error('La sesión guardada no tiene un formato válido.');
        setSessionUser(parsed.profile);
        setRole(parsed.role);
        // Restore browser-owned session state after the client has mounted.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAuthenticated(true);
        setAuthOpen(false);
      }
    } catch (error) {
      console.error('No se pudo restaurar la sesión de CITT Stock.', error);
      try {
        window.sessionStorage.removeItem(authStorageKey);
      } catch (storageError) {
        console.error('No se pudo limpiar la sesión inválida de CITT Stock.', storageError);
      }
      toast.error('No se pudo recuperar tu sesión. Inicia sesión nuevamente.');
    } finally {
      setAuthReady(true);
    }
  }, [setRole, setSessionUser]);

  useEffect(() => {
    if (!authReady || !authenticated) return;
    if (role === 'GLOBAL' && pathname !== '/pedidos') router.replace('/pedidos');
    if (role !== 'ADMIN' && pathname === '/configuracion') router.replace('/');
  }, [authReady, authenticated, pathname, role, router]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const visibleNavigation = navigation.filter(({ role: access }) =>
    access === 'all' || (access === 'admin' ? role === 'ADMIN' : role !== 'GLOBAL'),
  );
  const activeAlertCount =
    data.assets.filter((asset) => asset.available === 0 || asset.available / Math.max(asset.total, 1) * 100 <= data.settings.lowStockThreshold).length +
    data.members.filter((member) => member.blocked).length +
    data.workOrders.filter((order) => order.status !== 'Finalizada').length;
  const userInitials = currentUser.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const authenticate = (profile: SessionProfile, nextRole: SessionRole) => {
    try {
      window.sessionStorage.setItem(authStorageKey, JSON.stringify({ profile, role: nextRole }));
      setSessionUser(profile);
      setRole(nextRole);
      setAuthenticated(true);
      setAuthOpen(false);
      router.replace(nextRole === 'GLOBAL' ? '/pedidos' : '/');
    } catch (error) {
      console.error('No se pudo guardar la sesión de CITT Stock.', error);
      toast.error('No se pudo guardar la sesión en esta pestaña.');
    }
  };

  const registerProfile = (profile: SessionProfile) => {
    setData((current) => ({
      ...current,
      members: [{
        id: `M-REG-${Date.now()}`,
        ...profile,
        blocked: false,
        loans: 0,
        overdueDays: 0,
      }, ...current.members],
    }));
  };

  const logout = () => {
    try {
      window.sessionStorage.removeItem(authStorageKey);
    } catch (error) {
      console.error('No se pudo borrar la sesión de CITT Stock.', error);
      toast.error('No se pudo borrar la sesión guardada.');
    }
    setAuthenticated(false);
    setSessionUser(null);
    setRole('ADMIN');
    setAuthOpen(true);
    router.replace('/');
  };

  return (
    <>
    {authReady && authenticated && <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 transition-colors duration-200 dark:bg-[#070b14] dark:text-slate-100">
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-64'
        } z-30 flex h-screen shrink-0 select-none flex-col border-r border-slate-200 bg-white transition-[width] duration-300 dark:border-slate-800/80 dark:bg-[#0c1220]`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <Image src="/citt-logo.png" alt="" width={447} height={447} className="h-10 w-10 shrink-0 rounded-full object-cover" />
            {!collapsed && (
              <div className="truncate whitespace-nowrap">
                <h1 className="block text-base font-bold leading-tight tracking-tight text-slate-900 dark:text-white">CITT Stock</h1>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">Gestión &amp; Trazabilidad</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
            title={collapsed ? 'Expandir menú' : 'Retraer menú'}
            className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-3 text-sm font-medium">
          {visibleNavigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition ${
                  active
                    ? 'bg-sky-500/15 font-semibold text-sky-600 dark:text-sky-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.href === '/alertas' && activeAlertCount > 0 && (
                  <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">{activeAlertCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

      </aside>

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <div className="z-20 shrink-0 bg-slate-50 px-4 pb-2 pt-4 dark:bg-[#070b14] md:px-8">
          <header className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm dark:border-slate-800/90 dark:bg-[#111827]">
            <div className="flex min-w-0 items-center gap-3.5">
              <Image src="/citt-logo.png" alt="" width={447} height={447} className="h-11 w-11 shrink-0 rounded-full object-cover" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-lg font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white md:text-xl">CITT Stock</h2>
                  <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">{roleLabels[role]}</span>
                </div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{currentUser.name}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
                title="Cambiar tema"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:border-slate-700/60 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <span className="hidden h-8 w-px bg-slate-200 dark:bg-slate-800 sm:block" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/15 text-sm font-bold text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
                  {userInitials}
                </div>
                <div className="hidden leading-tight sm:block">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser.role}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{data.settings.campus}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión" className="flex items-center gap-2 rounded-lg px-2 py-2 text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/40 sm:px-3">
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span className="hidden text-xs font-semibold sm:inline">Cerrar sesión</span>
                </button>
              </div>
            </div>
          </header>
        </div>
        <main className="flex-1 space-y-6 overflow-y-auto px-4 py-4 md:px-8">{children}</main>
      </div>
    </div>}
    <AuthScreen
      open={authReady && authOpen}
      members={data.members}
      onAuthenticate={authenticate}
      onRegister={registerProfile}
    />
    </>
  );
}
