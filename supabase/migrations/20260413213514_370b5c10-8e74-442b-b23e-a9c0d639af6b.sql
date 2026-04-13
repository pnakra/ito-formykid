-- Add digest preferences to profiles
ALTER TABLE public.profiles
  ADD COLUMN digest_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN digest_age_group text;

-- Create scan_notes table for longitudinal parent notes
CREATE TABLE public.scan_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id uuid NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  note_text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scan notes"
  ON public.scan_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scan notes"
  ON public.scan_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scan notes"
  ON public.scan_notes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_scan_notes_scan_id ON public.scan_notes(scan_id);
CREATE INDEX idx_scan_notes_user_id ON public.scan_notes(user_id);
