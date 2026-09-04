import { Check, Zap, Loader as Loader2 } from 'lucide-react';
import { PRODUCTS_LIST } from '@/stripe-config';
import { useCheckout } from '@/hooks/useCheckout';
import { useSubscription } from '@/hooks/useSubscription';

export default function PricingPage() {
  const { startCheckout, loadingPriceId, error } = useCheckout();
  const { planName, isActive } = useSubscription();

  return (
    <div className="min-h-screen bg-gray-950 text-white py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-indigo-400 text-sm font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose your plan
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Scale your lead generation with the right plan for your business.
          </p>
          {isActive && (
            <div className="mt-4 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Current plan: <strong>{planName}</strong>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 max-w-md mx-auto bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRODUCTS_LIST.map((product, index) => {
            const isPro = product.name === 'Pro';
            const isLoading = loadingPriceId === product.priceId;
            const isCurrent = isActive && planName === product.name;

            return (
              <div
                key={product.id}
                className={`relative rounded-2xl border p-8 flex flex-col transition-all duration-300 ${
                  isPro
                    ? 'bg-indigo-600/10 border-indigo-500/40 shadow-xl shadow-indigo-500/10 scale-[1.02]'
                    : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-1">{product.name}</h2>
                  <p className="text-gray-400 text-sm">{product.description}</p>
                </div>

                <div className="mb-8">
                  <span className="text-4xl font-bold text-white">
                    {product.currencySymbol}{product.price.toFixed(0)}
                  </span>
                  <span className="text-gray-400 text-sm ml-1">/month</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isPro ? 'text-indigo-400' : 'text-emerald-400'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => startCheckout(product.priceId, product.mode)}
                  disabled={isLoading || isCurrent}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default'
                      : isPro
                      ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-60'
                      : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:border-gray-600 disabled:opacity-60'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Redirecting…
                    </>
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : (
                    `Get ${product.name}`
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-gray-500 text-sm mt-10">
          All plans include a 14-day free trial. Cancel anytime.
        </p>
      </div>
    </div>
  );
}