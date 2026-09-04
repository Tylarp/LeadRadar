import { Star } from 'lucide-react';

export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      <span className="font-medium text-slate-700">{rating.toFixed(1)}</span>
    </div>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const tone =
    score === 0
      ? 'bg-slate-100 text-slate-500 ring-slate-200'
      : score < 45
        ? 'bg-red-50 text-red-700 ring-red-200'
        : score < 70
          ? 'bg-amber-50 text-amber-700 ring-amber-200'
          : 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  const label = score === 0 ? 'None' : `${score}`;
  return (
    <span
      className={`inline-flex min-w-[2.75rem] justify-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${tone}`}
    >
      {label}
    </span>
  );
}

export function OpportunityBadge({ score }: { score: number }) {
  const heat = score === 0 ? 100 : Math.max(0, 100 - score);
  const tone =
    heat >= 70
      ? 'bg-red-500'
      : heat >= 45
        ? 'bg-amber-500'
        : 'bg-slate-300';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${heat}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-500">{heat}</span>
    </div>
  );
}
