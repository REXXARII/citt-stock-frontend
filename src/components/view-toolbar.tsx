'use client';

import { CalendarDays, Grid2X2, List, Search } from 'lucide-react';

export interface ViewFilterOption {
  value: string;
  label: string;
}

interface ViewToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  searchPlaceholder: string;
  date: string;
  onDateChange: (value: string) => void;
  dateLabel?: string;
  filter: string;
  filterOptions: ViewFilterOption[];
  onFilterChange: (value: string) => void;
  pills: ViewFilterOption[];
  activePill: string;
  onPillChange: (value: string) => void;
  view: 'list' | 'grid';
  onViewChange: (view: 'list' | 'grid') => void;
}

export function ViewToolbar({
  query,
  onQueryChange,
  searchPlaceholder,
  date,
  onDateChange,
  dateLabel = 'Filtrar por fecha',
  filter,
  filterOptions,
  onFilterChange,
  pills,
  activePill,
  onPillChange,
  view,
  onViewChange,
}: ViewToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex min-w-0 flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-[#111827] md:flex-row md:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <span className="sr-only">Buscar</span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-xl border border-transparent bg-transparent pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-sky-500/50 focus:bg-slate-50 dark:focus:bg-slate-900/60"
          />
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative">
            <span className="sr-only">Filtrar por tipo</span>
            <select
              value={filter}
              onChange={(event) => onFilterChange(event.target.value)}
              className="h-11 w-full min-w-40 appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {filterOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="relative">
            <span className="sr-only">{dateLabel}</span>
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              aria-label={dateLabel}
              type="date"
              value={date}
              onChange={(event) => onDateChange(event.target.value)}
              className="h-11 w-full min-w-44 rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {pills.map((pill) => (
            <button
              key={pill.value}
              type="button"
              aria-pressed={activePill === pill.value}
              onClick={() => onPillChange(pill.value)}
              className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                activePill === pill.value
                  ? 'border-sky-500 bg-sky-500 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-[#111827]">
          <button
            type="button"
            aria-label="Vista de lista"
            aria-pressed={view === 'list'}
            onClick={() => onViewChange('list')}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              view === 'list' ? 'bg-sky-500 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Vista de mosaico"
            aria-pressed={view === 'grid'}
            onClick={() => onViewChange('grid')}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              view === 'grid' ? 'bg-sky-500 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Grid2X2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
