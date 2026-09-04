/*
# Convert LeadRadar to multi-user with subscriptions

1. Modified Tables
   - `searches`
     - Add `user_id` (uuid, NOT NULL, defaults to auth.uid(), references auth.users, cascade delete)
     - This scopes every search to the signed-in user who created it.
   - `leads`
     - Add `user_id` (uuid, NOT NULL, defaults to auth.uid(), references auth.users, cascade delete)
     - This scopes every lead to the signed-in user who owns the parent search.

2. New Tables
   - `subscriptions`
     - `id` (uuid, primary key)
     - `user_id` (uuid, NOT NULL, references auth.users, cascade delete)
     - `stripe_customer_id` (text, unique)
     - `stripe_subscription_id` (text, unique, nullable)
     - `plan` (text) — 'starter' | 'pro' | 'agency'
     - `status` (text) — 'active' | 'canceled' | 'past_due' | 'trialing'
     - `searches_used` (int, default 0) — how many free searches the user has consumed
     - `current_period_end` (timestamptz, nullable)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)
     - One row per user. The free-search counter lives here so it persists across reloads.

3. Security
   - Re-enable RLS on `searches` and `leads` with owner-scoped policies
     (TO authenticated, auth.uid() = user_id). The old anon policies are dropped.
   - Enable RLS on `subscriptions` with owner-scoped SELECT and UPDATE policies.
     INSERT is handled server-side by the webhook edge function (service role bypasses RLS),
     so no client INSERT policy is needed.

4. Important Notes
   1. `user_id` columns default to `auth.uid()` so client inserts that omit
      `user_id` still satisfy the WITH CHECK policy.
   2. The free-search limit is enforced by the frontend reading `searches_used`
      from the `subscriptions` table; the counter is incremented atomically by
      the webhook on checkout completion (resetting to 0 for paid users) and by
      the frontend after each free search.
*/

-- Add user_id to searches
ALTER TABLE searches ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_searches_user_id ON searches(user_id);

-- Add user_id to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);

-- Recreate searches policies (drop old anon ones, add owner-scoped)
DROP POLICY IF EXISTS "anon_select_searches" ON searches;
DROP POLICY IF EXISTS "anon_insert_searches" ON searches;
DROP POLICY IF EXISTS "anon_update_searches" ON searches;
DROP POLICY IF EXISTS "anon_delete_searches" ON searches;

DROP POLICY IF EXISTS "select_own_searches" ON searches;
CREATE POLICY "select_own_searches" ON searches FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_searches" ON searches;
CREATE POLICY "insert_own_searches" ON searches FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_searches" ON searches;
CREATE POLICY "update_own_searches" ON searches FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_searches" ON searches;
CREATE POLICY "delete_own_searches" ON searches FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Recreate leads policies
DROP POLICY IF EXISTS "anon_select_leads" ON leads;
DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
DROP POLICY IF EXISTS "anon_update_leads" ON leads;
DROP POLICY IF EXISTS "anon_delete_leads" ON leads;

DROP POLICY IF EXISTS "select_own_leads" ON leads;
CREATE POLICY "select_own_leads" ON leads FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_leads" ON leads;
CREATE POLICY "insert_own_leads" ON leads FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_leads" ON leads;
CREATE POLICY "update_own_leads" ON leads FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_leads" ON leads;
CREATE POLICY "delete_own_leads" ON leads FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'free',
  searches_used int NOT NULL DEFAULT 0,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_subscription" ON subscriptions;
CREATE POLICY "select_own_subscription" ON subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_subscription" ON subscriptions;
CREATE POLICY "update_own_subscription" ON subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
