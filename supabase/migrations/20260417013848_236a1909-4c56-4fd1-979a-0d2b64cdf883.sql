-- Make user_id nullable so anonymous scans can be stored
ALTER TABLE public.scans ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing insert policy and recreate to allow either:
--  (a) authenticated user inserting their own scan, or
--  (b) service role inserting an anonymous scan (user_id is null)
DROP POLICY IF EXISTS "Users can insert own scans" ON public.scans;

CREATE POLICY "Users can insert own scans"
  ON public.scans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow service role full access for server-side anonymous inserts
CREATE POLICY "Service role can manage scans"
  ON public.scans
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');