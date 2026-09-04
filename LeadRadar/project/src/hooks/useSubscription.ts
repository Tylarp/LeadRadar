import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { STRIPE_PRODUCTS } from '@/stripe-config';

export interface Subscription {
  plan: string;
  status: string;
  searches_used: number;
  current_period_end: string | null;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  async function fetchSubscription() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan, status, searches_used, current_period_end')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
      }

      setSubscription(data ?? null);
    } catch (err) {
      console.error('Subscription fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const planName = subscription?.plan
    ? (STRIPE_PRODUCTS[subscription.plan]?.name ?? subscription.plan)
    : 'Free';

  const isActive =
    subscription?.status === 'active' || subscription?.status === 'trialing';

  return { subscription, loading, planName, isActive, refetch: fetchSubscription };
}