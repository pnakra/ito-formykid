CREATE TABLE public.dinner_prompt_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  age_band text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  unsubscribed_at timestamptz
);
GRANT INSERT ON public.dinner_prompt_subscribers TO anon, authenticated;
GRANT ALL ON public.dinner_prompt_subscribers TO service_role;
ALTER TABLE public.dinner_prompt_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe to dinner prompts" ON public.dinner_prompt_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(email) BETWEEN 3 AND 254 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND age_band IN ('13-15','16-18')
    AND unsubscribed_at IS NULL
  );