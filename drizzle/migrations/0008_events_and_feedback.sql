CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  anon_id text NOT NULL,
  user_id uuid,
  source text NOT NULL DEFAULT 'other',
  event text NOT NULL,
  props jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT INSERT ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log events" ON public.events FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(event) <= 60 AND char_length(anon_id) <= 64 AND char_length(source) <= 20
    AND pg_column_size(props) < 2000
    AND (user_id IS NULL OR user_id = auth.uid()));

CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'other',
  pid text,
  sample_id text,
  in_scope text,
  safety_category text,
  helped text NOT NULL,
  comment text
);
GRANT INSERT ON public.feedback TO anon, authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can leave feedback" ON public.feedback FOR INSERT TO anon, authenticated
  WITH CHECK (helped IN ('yes','somewhat','no') AND (comment IS NULL OR char_length(comment) <= 500)
    AND (pid IS NULL OR char_length(pid) <= 100));