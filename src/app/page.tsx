import Link from "next/link";
import { Boxes, ClipboardList, PackageCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <span className="mb-4 inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
            CITT Duoc UC San Bernardo
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Gestión de inventario
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Accede al catálogo de activos y al formulario de movimientos del centro de innovación.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Link
            href="/inventario"
            className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Boxes className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Inventario</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Consulta activos, ubicaciones, stock y código QR.
            </p>
            <span className="mt-6 inline-flex items-center font-semibold text-sky-700">
              Abrir catálogo →
            </span>
          </Link>

          <Link
            href="/movimientos"
            className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Movimientos</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Registra préstamos, devoluciones y pedidos de consumibles.
            </p>
            <span className="mt-6 inline-flex items-center font-semibold text-violet-700">
              Registrar movimiento →
            </span>
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
          <PackageCheck className="h-4 w-4" />
          Sistema de trazabilidad y control de inventario
        </div>
      </div>
    </main>
  );
}
