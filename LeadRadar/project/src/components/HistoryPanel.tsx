import { Clock, Trash2, Search as SearchIcon } from 'lucide-react';
import type { Search } from '@/lib/types';

interface Props {
  history: Search[];
  activeId: string | null;
  onOpen: (search: Search) => void;
  onDelete: (id: string) => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function HistoryPanel({ history, activeId, onOpen, onDelete }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 p-4">
        <Clock className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-900">Recent searches</h3>
      </div>
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
          <SearchIcon className="h-6 w-6" />
          <p className="mt-2 px-4 text-xs">Your searches will be saved here automatically.</p>
        </div>
      ) : (
        <ul className="max-h-[420px] divide-y divide-slate-50 overflow-y-auto">
          {history.map((s) => {
            const active = s.id === activeId;
            return (
              <li key={s.id}>
                <div
                  className={`group flex items-center justify-between px-4 py-3 transition ${
                    active ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <button onClick={() => onOpen(s)} className="min-w-0 flex-1 text-left">
                    <div className={`truncate text-sm font-medium ${active ? 'text-blue-700' : 'text-slate-900'}`}>
                      {s.niche}
                    </div>
                    <div className="truncate text-xs text-slate-400">
                      {s.location} · {s.requested_count} · {timeAgo(s.created_at)}
                    </div>
                  </button>
                  <button
                    onClick={() => onDelete(s.id)}
                    className="ml-2 rounded-md p-1.5 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                    aria-label="Delete search"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
