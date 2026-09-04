import { useState } from 'react';
import { Check, Zap, Loader2 } from 'lucide-react';
import { createCheckout } from '@/lib/leads';

const TIERS = [
  {
    name: 'Starter',
    plan: 'starter',
    price: 10,
    tagline: 'For solo founders testing the waters',
    features: ['Up to 25 leads per search', '10 searches / month', 'CSV export', 'Website quality scores'],
    highlight: false,
  },
  {
    name: 'Pro',
    plan: 'pro',
    price: 20,
    tagline: 'For freelancers and consultants',
    features: ['Up to 100 leads per search', 'Unlimited searches', 'CSV export', 'Problem detection', 'Email & phone data'],
    highlight: true,
  },
  {
    name: 'Agency',
    plan: 'agency',
    price: 40,
    tagline: 'For teams selling at scale',
    features: ['Everything in Pro', 'Bulk exports', 'Team seats', 'Priority support', 'API access'],
    highlight: false,
  },
];

interface Props {
  currentPlan?: string;
}

export function Pricing({ currentPlan }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(plan: string) {
    setError(null);
    setLoading(plan);
    try {
      const url = await createCheckout(plan);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-slate-900">Simple, honest pricing</h2>
        <p className="mt-2 text-slate-500">Find your next 100 customers before your morning coffee.</p>
      </div>
      {error && (
        <div className="mx-auto mb-6 max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-3">
        {TIERS.map((tier) => {
          const isCurrent = currentPlan === tier.plan;
          return (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-6 shadow-sm transition hover:shadow-md ${
                tier.highlight ? 'border-blue-500 bg-white ring-2 ring-blue-100' : 'border-slate-200 bg-white'
              }`}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                  <Zap className="h-3 w-3" />
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{tier.tagline}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900">${tier.price}</span>
                <span className="text-sm text-slate-400">/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(tier.plan)}
                disabled={isCurrent || loading !== null}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                  isCurrent
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                    : tier.highlight
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {loading === tier.plan && <Loader2 className="h-4 w-4 animate-spin" />}
                {isCurrent ? 'Current plan' : `Get ${tier.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
