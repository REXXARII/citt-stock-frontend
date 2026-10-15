'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Package,
  Repeat,
  Users,
  Wrench,
  Bell,
  PieChart,
  Settings,
  Menu,
  Moon,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = [
    { label: 'Catálogo de Activos', href: '/inventario', icon: Package },
    { label: 'Movimientos & Préstamos', href: '/movimientos', icon: Repeat },
    { label: 'Miembros & Solicitantes', href: '#', icon: Users, disabled: true },
    { label: 'Mantenimiento (OT)', href: '#', icon: Wrench, disabled: true },
    { label: 'Alertas', href: '#', icon: Bell, badge: '5', disabled: true },
    { label: 'Reportes & Analítica', href: '#', icon: PieChart, disabled: true },
    { label: 'Parametrización', href: '#', icon: Settings, disabled: true },
  ];

  return (
    <div className={`min-h-screen flex bg-slate-50 text-slate-800 ${darkMode ? 'dark bg-[#0b0f17] text-slate-100' : ''}`}>
      {/* Sidebar fijo */}
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-64'
        } bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 flex-shrink-0 h-screen sticky top-0 z-30 flex flex-col transition-all duration-300`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center font-bold text-white shadow-md shadow-sky-500/20 flex-shrink-0">
              <Box className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <h1 className="font-bold text-sm leading-none text-slate-800 dark:text-white">CITT Stock</h1>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Duoc UC San Bernardo</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 rounded-lg"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        <nav className="p-3 space-y-1 text-xs font-semibold overflow-y-auto flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.disabled ? '#' : item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                  isActive
                    ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-20 flex-shrink-0">
          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
            {pathname === '/inventario' ? 'Catálogo de Activos' : 'Gestión de Movimientos'}
          </span>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs bg-slate-50 border-slate-200 font-normal">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600 mr-1.5" />
              Paz Constanza Morales Saavedra
            </Badge>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-8 w-8 text-slate-500">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
