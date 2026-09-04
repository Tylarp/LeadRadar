import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Subscription } from '@/lib/types';

interface AuthState {
  user: User | null;
  session: Session | null;
  subscription: Subscription | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadSubscription(userId: string) {
    const { data } = await supabase
      .from('subscriptions')
      .select()
      .eq('user_id', userId)
      .maybeSingle();
    if (data) {
      setSubscription(data as Subscription);
    } else {
      // No row yet (user signed up before the trigger). Create one.
      const { data: created } = await supabase
        .from('subscriptions')
        .upsert(
          { user_id: userId, plan: 'free', status: 'free', searches_used: 0 },
          { onConflict: 'user_id' }
        )
        .select()
        .maybeSingle();
      setSubscription((created as Subscription) ?? null);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadSubscription(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await loadSubscription(newSession.user.id);
        } else {
          setSubscription(null);
        }
      })();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function refreshSubscription() {
    if (user) await loadSubscription(user.id);
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSubscription(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, session, subscription, loading, signUp, signIn, signOut, refreshSubscription }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
