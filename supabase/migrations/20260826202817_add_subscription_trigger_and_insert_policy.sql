/*
# Auto-create subscription row on signup + INSERT policy

1. New Functions
   - `handle_new_user_subscription()` — trigger function that inserts a row
     into `subscriptions` with plan='free', status='free', searches_used=0
     every time a new auth.users row is created. This ensures the free-search
     counter exists from the moment the user signs up.

2. New Triggers
   - `on_auth_user_created` — fires AFTER INSERT on auth.users, calls the
     function above.

3. Security Changes
   - Add an INSERT policy on `subscriptions` so authenticated users can
     insert their own row (auth.uid() = user_id). This is a fallback in
     case the trigger doesn't fire (e.g. existing users without a row).

4. Important Notes
   1. The trigger runs with SECURITY DEFINER (service role) so it can write
      to subscriptions even though RLS is enabled.
   2. The function uses INSERT ... ON CONFLICT DO NOTHING so re-running the
      trigger or a duplicate signup won't error.
   3. Existing auth.users rows that predate this trigger won't have a
      subscription row. The frontend handles this by upserting on first
      search if no row is found.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status, searches_used)
  VALUES (NEW.id, 'free', 'free', 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- Allow authenticated users to insert their own subscription row (fallback)
DROP POLICY IF EXISTS "insert_own_subscription" ON subscriptions;
CREATE POLICY "insert_own_subscription" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
