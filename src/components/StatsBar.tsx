import { Users, Globe2, Gauge, Flame } from 'lucide-react';
import type { Lead } from '@/lib/types';

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`mb-2 inline-flex rounded-lg p-2 ${tone}`}>{icon}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

export function StatsBar({ leads }: { leads: Lead[] }) {
  const total = leads.length;
  const noWebsite = leads.filter((l) => !l.website).length;
  const withSite = leads.filter((l) => l.website);
  const avgScore =
    withSite.length > 0
      ? Math.round(withSite.reduce((s, l) => s + l.website_quality_score, 0) / withSite.length)
      : 0;
  const hot = leads.filter((l) => l.website_quality_score === 0 || l.website_quality_score < 45).length;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat
        icon={<Users className="h-4 w-4 text-blue-600" />}
        label="Total leads found"
        value={String(total)}
        tone="bg-blue-50"
      />
      <Stat
        icon={<Globe2 className="h-4 w-4 text-red-600" />}
        label="No website"
        value={String(noWebsite)}
        tone="bg-red-50"
      />
      <Stat
        icon={<Gauge className="h-4 w-4 text-amber-600" />}
        label="Avg. website score"
        value={String(avgScore)}
        tone="bg-amber-50"
      />
      <Stat
        icon={<Flame className="h-4 w-4 text-emerald-600" />}
        label="Hot opportunities"
        value={String(hot)}
        tone="bg-emerald-50"
      />
    </div>
  );
}
