import Link from "next/link";
import { Boxes, ClipboardList } from "lucide-react";
import type { ReactNode } from "react";

type LayoutShellProps = {
  children: ReactNode;
};

export default function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-slate-900"
            aria-label="CITT Duoc UC San Bernardo, inicio"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <Boxes className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-bold">CITT Duoc UC</span>
              <span className="block text-xs text-slate-500">San Bernardo</span>
            </span>
          </Link>

          <nav aria-label="Navegación principal" className="flex items-center gap-2">
            <Link
              href="/inventario"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <Boxes className="size-4" aria-hidden="true" />
              Inventario
            </Link>
            <Link
              href="/movimientos"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <ClipboardList className="size-4" aria-hidden="true" />
              Movimientos
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex-1">{children}</div>
    </div>
  );
}
