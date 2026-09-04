import { Radar, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Radar className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">LeadRadar</span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <a href="#pricing" className="hidden text-slate-600 transition hover:text-slate-900 sm:block">
            Pricing
          </a>
          {user && (
            <>
              <span className="hidden text-slate-500 sm:block">{user.email}</span>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
