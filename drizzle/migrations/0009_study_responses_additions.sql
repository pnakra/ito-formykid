ALTER TABLE public.study_responses
  ADD COLUMN IF NOT EXISTS anon_id text,
  ADD COLUMN IF NOT EXISTS follow_up_ok text,
  ADD COLUMN IF NOT EXISTS attention_check text;
DROP POLICY IF EXISTS "Anyone can submit study responses" ON public.study_responses;
CREATE POLICY "Anyone can submit study responses" ON public.study_responses
  FOR INSERT TO anon, authenticated
  WITH CHECK ((anon_id IS NULL OR char_length(anon_id) <= 64)
    AND (follow_up_ok IS NULL OR follow_up_ok IN ('yes','no'))
    AND (attention_check IS NULL OR attention_check IN ('yes','somewhat','no')));