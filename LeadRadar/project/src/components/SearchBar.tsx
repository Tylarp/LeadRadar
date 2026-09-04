import { useState } from 'react';
import { Search, MapPin, Briefcase, Loader2 } from 'lucide-react';

interface Props {
  onSearch: (niche: string, location: string, count: number) => void;
  loading: boolean;
}

const COUNTS = [25, 50, 100];

const EXAMPLES = [
  { niche: 'Roofing companies', location: 'Massachusetts' },
  { niche: 'Dentists', location: 'Austin, TX' },
  { niche: 'Law firms', location: 'Chicago' },
  { niche: 'Auto repair shops', location: 'Denver' },
];

export function SearchBar({ onSearch, loading }: Props) {
  const [niche, setNiche] = useState('');
  const [location, setLocation] = useState('');
  const [count, setCount] = useState(50);

  const canSubmit = niche.trim().length > 1 && location.trim().length > 1 && !loading;

  function submit() {
    if (!canSubmit) return;
    onSearch(niche.trim(), location.trim(), count);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Niche
          </label>
          <div className="relative">
            <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="e.g. Roofing companies"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Location
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="e.g. Massachusetts"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Leads
          </label>
          <div className="flex overflow-hidden rounded-lg border border-slate-300">
            {COUNTS.map((c) => (
              <button
                key={c}
                onClick={() => setCount(c)}
                className={`px-3.5 py-2.5 text-sm font-medium transition ${
                  count === c
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={submit}
          disabled={!canSubmit}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Finding
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Find leads
            </>
          )}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400">Try:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.niche}
            onClick={() => {
              setNiche(ex.niche);
              setLocation(ex.location);
            }}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
          >
            {ex.niche} · {ex.location}
          </button>
        ))}
      </div>
    </div>
  );
}
