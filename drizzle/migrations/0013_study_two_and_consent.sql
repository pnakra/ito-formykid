DROP POLICY IF EXISTS "Anyone can submit study answers" ON public.study_answers;
CREATE POLICY "Anyone can submit study answers" ON public.study_answers FOR INSERT TO anon, authenticated
WITH CHECK ((page_key = ANY (ARRAY['screener','consent','joke','screenshot','image','live','own1','own2'])) AND ((pid IS NULL) OR (char_length(pid) <= 100)) AND ((anon_id IS NULL) OR (char_length(anon_id) <= 64)) AND (pg_column_size(answers) < 4000));

ALTER TABLE public.study_responses ADD COLUMN IF NOT EXISTS study_version text NOT NULL DEFAULT 'prolific';
ALTER TABLE public.study_responses ADD COLUMN IF NOT EXISTS would_come_back text;
ALTER TABLE public.study_responses ADD COLUMN IF NOT EXISTS come_back_why text;

DROP POLICY IF EXISTS "Anyone can submit study responses" ON public.study_responses;
CREATE POLICY "Anyone can submit study responses" ON public.study_responses FOR INSERT TO anon, authenticated
WITH CHECK (((anon_id IS NULL) OR (char_length(anon_id) <= 64)) AND ((follow_up_ok IS NULL) OR (follow_up_ok = ANY (ARRAY['yes','no']))) AND ((attention_check IS NULL) OR (attention_check = ANY (ARRAY['yes','somewhat','no']))) AND (study_version = ANY (ARRAY['prolific','prolific2'])) AND ((would_come_back IS NULL) OR (would_come_back = ANY (ARRAY['yes','maybe','no']))) AND ((come_back_why IS NULL) OR (char_length(come_back_why) <= 3000)));