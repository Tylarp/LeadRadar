import { useEffect, useState } from 'react';
import { CircleCheck as CheckCircle, ArrowRight, Loader as Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export default function SuccessPage() {
  const { planName, isActive, loading, refetch } = useSubscription();
  const [attempts, setAttempts] = useState(0);

  // Poll until subscription is active (webhook may take a moment)
  useEffect(() => {
    if (isActive || attempts >= 8) return;
    const timer = setTimeout(() => {
      refetch();
      setAttempts((a) => a + 1);
    }, 1500);
    return () => clearTimeout(timer);
  }, [isActive, attempts, refetch]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {loading && !isActive ? (
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
            <p className="text-sm">Confirming your subscription…</p>
          </div>
        ) : (
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-10 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white mb-3">
              You're all set!
            </h1>
            <p className="text-gray-400 mb-2">
              Your <span className="text-white font-semibold">{planName}</span> subscription is now active.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Start finding high-quality leads for your business right away.
            </p>

            <a
              href="/"
              className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}