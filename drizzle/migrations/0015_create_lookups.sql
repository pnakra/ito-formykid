CREATE TABLE public.lookups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  anon_id text,
  user_id uuid,
  source text NOT NULL DEFAULT 'other',
  input_type text NOT NULL,
  query_text text NOT NULL,
  intake jsonb NOT NULL DEFAULT '{}'::jsonb,
  response jsonb
);
GRANT INSERT ON public.lookups TO anon, authenticated;
GRANT ALL ON public.lookups TO service_role;
ALTER TABLE public.lookups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record a lookup" ON public.lookups FOR INSERT TO anon, authenticated
WITH CHECK (char_length(query_text) <= 4000 AND (anon_id IS NULL OR char_length(anon_id) <= 64)
  AND char_length(source) <= 20 AND char_length(input_type) <= 20
  AND pg_column_size(intake) < 8000 AND (response IS NULL OR pg_column_size(response) < 8000)
  AND (user_id IS NULL OR user_id = auth.uid()));
CREATE INDEX lookups_created_at_idx ON public.lookups (created_at);
CREATE OR REPLACE FUNCTION public.prune_old_lookups() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.lookups WHERE created_at < now() - interval '1 year';
  RETURN NULL;
END; $$;
CREATE TRIGGER prune_old_lookups AFTER INSERT ON public.lookups FOR EACH STATEMENT EXECUTE FUNCTION public.prune_old_lookups();
ALTER TABLE public.feedback ADD COLUMN lookup_id uuid;