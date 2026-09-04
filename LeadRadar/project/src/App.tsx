import { useEffect, useState } from 'react';
import { AlertCircle, Target } from 'lucide-react';
import type { Lead, Search } from '@/lib/types';
import {
  runSearch,
  getHistory,
  getLeadsForSearch,
  deleteSearch,
  incrementSearchCount,
} from '@/lib/leads';
import { useAuth } from '@/lib/auth';
import { isWhitelisted } from '@/lib/whitelist';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { StatsBar } from '@/components/StatsBar';
import { LeadsTable } from '@/components/LeadsTable';
import { LeadDrawer } from '@/components/LeadDrawer';
import { HistoryPanel } from '@/components/HistoryPanel';
import { Pricing } from '@/components/Pricing';
import { Paywall } from '@/components/Paywall';
import { AuthScreen } from '@/components/AuthScreen';

const FREE_SEARCH_LIMIT = 1;

function isPaid(sub: { plan: string; status: string } | null): boolean {
  if (!sub) return false;
  return sub.plan !== 'free' && sub.status === 'active';
}

function App() {
  const { user, subscription, loading, refreshSubscription } = useAuth();
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Search[]>([]);
  const [active, setActive] = useState<Search | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Lead | null>(null);

  const paid = isPaid(subscription);
  const whitelisted = isWhitelisted(user?.email);
  const searchesUsed = subscription?.searches_used ?? 0;
  const canSearch = whitelisted || paid || searchesUsed < FREE_SEARCH_LIMIT;

  useEffect(() => {
    if (!user) return;
    getHistory()
      .then(setHistory)
      .catch(() => setError('Could not load your recent searches.'));
  }, [user]);

  // After returning from Stripe checkout, refresh subscription status.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      refreshSubscription();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [refreshSubscription]);

  async function handleSearch(niche: string, location: string, count: number) {
    if (!canSearch) return;
    setSearching(true);
    setError(null);
    try {
      const { search, leads: found } = await runSearch(niche, location, count);
      setActive(search);
      setLeads(found);
      setHistory((prev) => [search, ...prev]);
      await incrementSearchCount();
      await refreshSubscription();
    } catch {
      setError('Something went wrong while finding leads. Please try again.');
    } finally {
      setSearching(false);
    }
  }

  async function openSearch(search: Search) {
    setSearching(true);
    setError(null);
    try {
      const found = await getLeadsForSearch(search.id);
      setActive(search);
      setLeads(found);
    } catch {
      setError('Could not open that search.');
    } finally {
      setSearching(false);
    }
  }

  async function removeSearch(id: string) {
    try {
      await deleteSearch(id);
      setHistory((prev) => prev.filter((s) => s.id !== id));
      if (active?.id === id) {
        setActive(null);
        setLeads([]);
      }
    } catch {
      setError('Could not delete that search.');
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <Target className="h-3.5 w-3.5" />
            Find businesses that need what you sell
          </div>
          <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            Turn a niche and a city into a list of ready-to-pitch leads
          </h1>
          <p className="mt-3 text-slate-500">
            Enter what you're looking for and where. We surface local businesses, score their online
            presence, and flag exactly what you can help them fix.
          </p>
          {!paid && !whitelisted && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
              {canSearch
                ? `Free search remaining: ${FREE_SEARCH_LIMIT - searchesUsed} of ${FREE_SEARCH_LIMIT}`
                : 'Free search used — upgrade to keep searching'}
            </p>
          )}
          {whitelisted && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              You have full access — no payment required.
            </p>
          )}
        </div>

        {canSearch ? (
          <SearchBar onSearch={handleSearch} loading={searching} />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <p className="text-sm font-medium text-slate-600">
              You've used your free search. Scroll down to upgrade your plan.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-6">
            {active && leads.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {active.niche} <span className="text-slate-400">in</span> {active.location}
                    </h2>
                    <p className="text-sm text-slate-500">{leads.length} leads, sorted by opportunity</p>
                  </div>
                </div>
                <StatsBar leads={leads} />
                <LeadsTable
                  leads={leads}
                  niche={active.niche}
                  location={active.location}
                  onSelect={setSelected}
                />
              </>
            ) : !canSearch ? (
              <Paywall onCheckout={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">No search yet</h3>
                <p className="mt-1 max-w-xs text-sm text-slate-500">
                  Run a search above to see your first batch of leads and their opportunity scores.
                </p>
              </div>
            )}
          </div>

          <aside>
            <HistoryPanel
              history={history}
              activeId={active?.id ?? null}
              onOpen={openSearch}
              onDelete={removeSearch}
            />
          </aside>
        </div>
      </main>

      <Pricing currentPlan={paid ? subscription?.plan : undefined} />

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-400">
          LeadRadar — prospect smarter, close faster.
        </div>
      </footer>

      <LeadDrawer lead={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

export default App;
