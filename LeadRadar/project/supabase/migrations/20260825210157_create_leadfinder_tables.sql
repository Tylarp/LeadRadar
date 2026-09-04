/*
# LeadFinder — searches and leads

1. New Tables
   - `searches`
     - `id` (uuid, primary key)
     - `niche` (text) — the type of business searched for, e.g. "roofing companies"
     - `location` (text) — the geographic area searched, e.g. "Massachusetts"
     - `requested_count` (int) — how many leads the user asked for
     - `created_at` (timestamptz)
   - `leads`
     - `id` (uuid, primary key)
     - `search_id` (uuid, foreign key -> searches.id, cascade delete)
     - `business_name` (text)
     - `website` (text) — may be empty when the business has no site
     - `phone` (text)
     - `email` (text)
     - `google_rating` (numeric) — 0-5 star rating
     - `review_count` (int) — number of Google reviews
     - `website_quality_score` (int) — 0-100 assessment of the site
     - `has_social` (boolean) — whether they have any social presence
     - `estimated_traffic` (int) — estimated monthly website visitors
     - `problems` (text[]) — list of issues detected, used as sales angles
     - `created_at` (timestamptz)

2. Security
   - Enable RLS on both tables.
   - This is a single-tenant app with no sign-in, so anon and authenticated
     roles may read and write all rows (intentionally shared workspace).

3. Notes
   - `leads` are always tied to a parent `search`; deleting a search removes
     its leads automatically.
   - An index on `leads.search_id` keeps result loading fast.
*/

CREATE TABLE IF NOT EXISTS searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  niche text NOT NULL,
  location text NOT NULL,
  requested_count int NOT NULL DEFAULT 25,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id uuid NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  website text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  google_rating numeric NOT NULL DEFAULT 0,
  review_count int NOT NULL DEFAULT 0,
  website_quality_score int NOT NULL DEFAULT 0,
  has_social boolean NOT NULL DEFAULT false,
  estimated_traffic int NOT NULL DEFAULT 0,
  problems text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_search_id ON leads(search_id);

ALTER TABLE searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_searches" ON searches;
CREATE POLICY "anon_select_searches" ON searches FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_searches" ON searches;
CREATE POLICY "anon_insert_searches" ON searches FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_searches" ON searches;
CREATE POLICY "anon_update_searches" ON searches FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_searches" ON searches;
CREATE POLICY "anon_delete_searches" ON searches FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_leads" ON leads;
CREATE POLICY "anon_select_leads" ON leads FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_leads" ON leads;
CREATE POLICY "anon_update_leads" ON leads FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_leads" ON leads;
CREATE POLICY "anon_delete_leads" ON leads FOR DELETE
  TO anon, authenticated USING (true);
