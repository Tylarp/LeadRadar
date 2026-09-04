import { useMemo, useState } from 'react';
import { Globe, Download, SlidersHorizontal, Inbox } from 'lucide-react';
import type { Lead } from '@/lib/types';
import { ScoreBadge, StarRating, OpportunityBadge } from '@/components/Badges';

type Filter = 'all' | 'no_website' | 'weak_website' | 'no_social';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All leads' },
  { key: 'no_website', label: 'No website' },
  { key: 'weak_website', label: 'Weak website' },
  { key: 'no_social', label: 'No social' },
];

function toCsv(leads: Lead[]): string {
  const header = [
    'Business',
    'Website',
    'Phone',
    'Email',
    'Google rating',
    'Reviews',
    'Website score',
    'Has social',
    'Est. traffic',
    'Problems',
  ];
  const rows = leads.map((l) => [
    l.business_name,
    l.website,
    l.phone,
    l.email,
    l.google_rating,
    l.review_count,
    l.website_quality_score,
    l.has_social ? 'Yes' : 'No',
    l.estimated_traffic,
    l.problems.join('; '),
  ]);
  return [header, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

interface Props {
  leads: Lead[];
  niche: string;
  location: string;
  onSelect: (lead: Lead) => void;
}

export function LeadsTable({ leads, niche, location, onSelect }: Props) {
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    switch (filter) {
      case 'no_website':
        return leads.filter((l) => !l.website);
      case 'weak_website':
        return leads.filter((l) => l.website && l.website_quality_score < 55);
      case 'no_social':
        return leads.filter((l) => !l.has_social);
      default:
        return leads;
    }
  }, [leads, filter]);

  function exportCsv() {
    const blob = new Blob([toCsv(filtered)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${niche}-${location}-leads.csv`.replace(/\s+/g, '-').toLowerCase();
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
        <button
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Inbox className="h-8 w-8" />
          <p className="mt-2 text-sm">No leads match this filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-semibold">Business</th>
                <th className="px-4 py-3 font-semibold">Website</th>
                <th className="px-4 py-3 font-semibold">Rating</th>
                <th className="px-4 py-3 font-semibold">Site score</th>
                <th className="px-4 py-3 font-semibold">Opportunity</th>
                <th className="px-4 py-3 font-semibold">Issues</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => onSelect(lead)}
                  className="cursor-pointer border-b border-slate-50 transition hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{lead.business_name}</div>
                    <div className="text-xs text-slate-400">{lead.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    {lead.website ? (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Globe className="h-3.5 w-3.5" />
                        {lead.website.replace(/^https?:\/\/(www\.)?/, '').slice(0, 22)}
                      </span>
                    ) : (
                      <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                        None
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StarRating rating={lead.google_rating} />
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBadge score={lead.website_quality_score} />
                  </td>
                  <td className="px-4 py-3">
                    <OpportunityBadge score={lead.website_quality_score} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {lead.problems.length}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
