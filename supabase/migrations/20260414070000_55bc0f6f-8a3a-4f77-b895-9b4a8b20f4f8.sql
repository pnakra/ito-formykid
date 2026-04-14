-- Add longitudinal tracking columns to scans
ALTER TABLE public.scans
  ADD COLUMN IF NOT EXISTS domain_category text,
  ADD COLUMN IF NOT EXISTS confidence text,
  ADD COLUMN IF NOT EXISTS age_context text,
  ADD COLUMN IF NOT EXISTS concern_areas text[],
  ADD COLUMN IF NOT EXISTS spectrum_label text,
  ADD COLUMN IF NOT EXISTS summary_verdict text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'watching',
  ADD COLUMN IF NOT EXISTS status_updated_at timestamp with time zone DEFAULT now();

-- Allow users to update their own scans (for status changes)
CREATE POLICY "Users can update own scans"
  ON public.scans
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add linked_scan_id to scan_notes for linking notes to situation_log
ALTER TABLE public.scan_notes
  ADD COLUMN IF NOT EXISTS linked_situation_id uuid REFERENCES public.situation_log(id) ON DELETE SET NULL;

-- Allow users to update their own scan notes
CREATE POLICY "Users can update own scan notes"
  ON public.scan_notes
  FOR UPDATE
  USING (auth.uid() = user_id);