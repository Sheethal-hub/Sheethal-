import { RefreshCw, Wind } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  accentButtonClass: string;
}

export function Header({ onRefresh, isRefreshing, accentButtonClass }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-900/8 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        <a
          href="#overview"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-950 whitespace-nowrap shrink-0 font-display focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded-md"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Wind className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>AeroSense</span>
        </a>

        <nav
          aria-label="Primary sections"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <a
            href="#overview"
            className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Overview
          </a>
          <a
            href="#advisor"
            className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Health Advisor
          </a>
          <a
            href="#trends"
            className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            24h Trend
          </a>
          <a
            href="#assistant"
            className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            AI Assistant
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all duration-150 whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer disabled:opacity-65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 ${accentButtonClass}`}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>{isRefreshing ? 'Updating' : 'Refresh Feed'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
