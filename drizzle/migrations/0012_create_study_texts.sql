CREATE TABLE public.study_texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  pid text,
  anon_id text,
  kind text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT INSERT ON public.study_texts TO anon, authenticated;
GRANT ALL ON public.study_texts TO service_role;
ALTER TABLE public.study_texts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Study participants can submit texts" ON public.study_texts
FOR INSERT TO anon, authenticated
WITH CHECK (
  pid IS NOT NULL AND char_length(pid) <= 100
  AND (anon_id IS NULL OR char_length(anon_id) <= 64)
  AND kind = ANY (ARRAY['scan','practice'])
  AND pg_column_size(content) < 20000
);
COMMENT ON TABLE public.study_texts IS 'Study participants only (Prolific pid required): what they typed into the scan tool and practice chat, plus replies.';