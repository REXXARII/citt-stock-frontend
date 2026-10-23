'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Bell,
  ClipboardCheck,
  LayoutGrid,
  Menu,
  Moon,
  Package,
  PieChart,
  Repeat,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sun,
  Users,
  Wrench,
} from 'lucide-react';
import { useAppState, type SessionRole } from '@/components/app-state';

const navigation = [
  { label: 'Dashboard / Panel', href: '/', icon: LayoutGrid, role: 'staff' },
  { label: 'Catálogo de Activos', href: '/inventario', icon: Package, role: 'staff' },
  { label: 'Pedidos / Catálogo', href: '/pedidos', icon: ShoppingBag, role: 'all' },
  { label: 'Gestión de Pedidos', href: '/gestion-pedidos', icon: ClipboardCheck, role: 'staff' },
  { label: 'Movimientos / Historial', href: '/movimientos', icon: Repeat, role: 'staff' },
  { label: 'Miembros & Solicitantes', href: '/miembros', icon: Users, role: 'staff' },
  { label: 'Mantenimiento (OT)', href: '/mantenimiento', icon: Wrench, role: 'staff' },
  { label: 'Alertas', href: '/alertas', icon: Bell, role: 'staff' },
  { label: 'Reportes & Analítica', href: '/reportes', icon: PieChart, role: 'staff' },
  { label: 'Parametrización', href: '/configuracion', icon: Settings, role: 'admin' },
];

const pageTitles: Record<string, string> = Object.fromEntries(
  navigation.map(({ href, label }) => [href, label]),
);

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { role, setRole, currentUser, data } = useAppState();

  useEffect(() => {
    if (role === 'GLOBAL' && pathname !== '/pedidos') router.replace('/pedidos');
    if (role !== 'ADMIN' && pathname === '/configuracion') router.replace('/');
  }, [pathname, role, router]);

  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  const visibleNavigation = navigation.filter(({ role: access }) =>
    access === 'all' || (access === 'admin' ? role === 'ADMIN' : role !== 'GLOBAL'),
  );
  const activeAlertCount =
    data.assets.filter((asset) => asset.available === 0 || asset.available / Math.max(asset.total, 1) * 100 <= data.settings.lowStockThreshold).length +
    data.members.filter((member) => member.blocked).length +
    data.workOrders.filter((order) => order.status !== 'Finalizada').length;

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 dark:bg-[#070b14] dark:text-slate-100">
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-64'
        } bg-white dark:bg-[#0c1220] border-r border-slate-200 dark:border-slate-800 flex-shrink-0 h-screen sticky top-0 z-30 flex flex-col transition-all duration-300`}
      >
        <div className="h-20 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <Image src="/citt-logo.png" alt="Logo CITT" width={40} height={40} className="h-10 w-10 shrink-0 rounded-xl object-cover" />
            {!collapsed && (
              <div className="truncate">
                <h1 className="font-bold text-sm leading-none text-slate-900 dark:text-white">CITT Stock</h1>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Gestión &amp; Trazabilidad</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        <nav className="p-3 space-y-1 text-xs font-semibold overflow-y-auto flex-1">
          {visibleNavigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                  active
                    ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.href === '/alertas' && activeAlertCount > 0 && (
                  <span className="ml-auto rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] text-white">{activeAlertCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="border-t border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
            <label htmlFor="session-role" className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Rol / Usuario en sesión
            </label>
            <select
              id="session-role"
              value={role}
              onChange={(event) => {
                const nextRole = event.target.value as SessionRole;
                setRole(nextRole);
                if (nextRole === 'GLOBAL') router.push('/pedidos');
              }}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="ADMIN">Administrador (Acceso Total)</option>
              <option value="AYUDANTE">Alumno Ayudante</option>
              <option value="GLOBAL">Alumno Global (Consultar / Pedir)</option>
            </select>
          </div>
        )}
      </aside>

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-3 dark:border-slate-800 dark:bg-[#0c1220] md:px-7">
          <div>
            <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{pageTitles[pathname] ?? 'CITT Stock'}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{currentUser.role} · {currentUser.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] text-slate-500 dark:border-slate-700 sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />
              Sede San Bernardo
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={resolvedTheme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>
        <main className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
