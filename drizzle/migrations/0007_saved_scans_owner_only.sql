ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS result_json jsonb;
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS note text;
ALTER TABLE public.scans ADD CONSTRAINT scans_note_length CHECK (note IS NULL OR char_length(note) <= 500);
COMMENT ON COLUMN public.scans.risk_level IS 'DEPRECATED: full result lives in result_json';

ALTER TABLE public.scan_notes DROP CONSTRAINT scan_notes_scan_id_fkey;
ALTER TABLE public.scan_notes ADD CONSTRAINT scan_notes_scan_id_fkey
  FOREIGN KEY (scan_id) REFERENCES public.scans(id) ON DELETE CASCADE;
COMMENT ON TABLE public.scan_notes IS 'DEPRECATED: notes now live in scans.note';

DROP POLICY IF EXISTS "Service role can manage scans" ON public.scans;
DROP POLICY IF EXISTS "Users can insert own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can update own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can view own scans" ON public.scans;

REVOKE ALL ON public.scans FROM anon;
REVOKE ALL ON public.scan_notes FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scan_notes TO authenticated;
GRANT ALL ON public.scans TO service_role;
GRANT ALL ON public.scan_notes TO service_role;

CREATE POLICY "Owner can view saved scans" ON public.scans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner can save scans" ON public.scans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can update saved scans" ON public.scans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can delete saved scans" ON public.scans FOR DELETE TO authenticated USING (auth.uid() = user_id);