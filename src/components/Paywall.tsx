import { Lock, Sparkles } from 'lucide-react';
import { Pricing } from '@/components/Pricing';

interface Props {
  onCheckout: () => void;
}

export function Paywall({ onCheckout }: Props) {
  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
          <Lock className="h-7 w-7 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">You've used your free search</h2>
        <p className="mx-auto mt-2 max-w-md text-slate-600">
          You get one free search to try LeadRadar. To keep finding leads and exporting
          them to CSV, pick a plan below.
        </p>
        <button
          onClick={onCheckout}
          className="mx-auto mt-5 flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Sparkles className="h-4 w-4" />
          Upgrade now
        </button>
      </div>
      <div className="mt-10">
        <Pricing />
      </div>
    </div>
  );
}
