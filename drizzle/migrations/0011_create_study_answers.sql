CREATE TABLE public.study_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  pid text,
  anon_id text,
  page_key text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT INSERT ON public.study_answers TO anon, authenticated;
GRANT ALL ON public.study_answers TO service_role;
ALTER TABLE public.study_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit study answers" ON public.study_answers
FOR INSERT TO anon, authenticated
WITH CHECK (
  page_key IN ('screener','joke','screenshot','image','live')
  AND (pid IS NULL OR char_length(pid) <= 100)
  AND (anon_id IS NULL OR char_length(anon_id) <= 64)
  AND pg_column_size(answers) < 4000
);