import { supabase } from '@/lib/supabase';
import { generateLeads } from '@/lib/leadGenerator';
import { STRIPE_PRODUCTS } from '@/stripe-config';
import type { Lead, Search } from '@/lib/types';

export async function runSearch(
  niche: string,
  location: string,
  count: number
): Promise<{ search: Search; leads: Lead[] }> {
  const { data: search, error: searchErr } = await supabase
    .from('searches')
    .insert({ niche, location, requested_count: count })
    .select()
    .maybeSingle();

  if (searchErr) throw searchErr;
  if (!search) throw new Error('Could not create the search.');

  const generated = generateLeads(search.id, niche, location, count);

  const { data: leads, error: leadsErr } = await supabase
    .from('leads')
    .insert(generated)
    .select();

  if (leadsErr) throw leadsErr;

  return { search, leads: (leads ?? []) as Lead[] };
}

export async function getHistory(): Promise<Search[]> {
  const { data, error } = await supabase
    .from('searches')
    .select()
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []) as Search[];
}

export async function getLeadsForSearch(searchId: string): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select()
    .eq('search_id', searchId)
    .order('website_quality_score', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Lead[];
}

export async function deleteSearch(searchId: string): Promise<void> {
  const { error } = await supabase.from('searches').delete().eq('id', searchId);
  if (error) throw error;
}

export async function incrementSearchCount(): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const userId = userData.user.id;

  // Ensure a subscription row exists, then increment. Upsert first so
  // existing users who signed up before the trigger still get a row.
  await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      plan: 'free',
      status: 'free',
      searches_used: 0,
    },
    { onConflict: 'user_id' }
  );

  // Read current value, increment, and write back.
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, searches_used')
    .eq('user_id', userId)
    .maybeSingle();

  if (!sub) return;

  await supabase
    .from('subscriptions')
    .update({ searches_used: (sub.searches_used ?? 0) + 1 })
    .eq('id', sub.id);
}

export async function createCheckout(plan: string): Promise<string> {
  const product = STRIPE_PRODUCTS[plan];
  if (!product) throw new Error(`Unknown plan: ${plan}`);

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error('Not authenticated');

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      priceId: product.priceId,
      mode: product.mode,
      plan,
      successUrl: `${window.location.origin}/?checkout=success`,
      cancelUrl: `${window.location.origin}/?checkout=cancel`,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  const data = await response.json();
  if (!data.url) throw new Error('No checkout URL returned');
  return data.url;
}
