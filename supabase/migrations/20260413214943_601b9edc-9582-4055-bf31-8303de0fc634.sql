
-- Situation log for parent observations
CREATE TABLE public.situation_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  note_text text NOT NULL,
  category text,
  logged_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.situation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own situation log"
  ON public.situation_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own situation log"
  ON public.situation_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own situation log"
  ON public.situation_log FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_situation_log_user_id ON public.situation_log(user_id);

-- Protective factors self-assessment
CREATE TABLE public.protective_factors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  open_conversations text NOT NULL DEFAULT 'not_sure',
  come_without_judgment text NOT NULL DEFAULT 'not_sure',
  offline_friendships text NOT NULL DEFAULT 'not_sure',
  question_and_pushback text NOT NULL DEFAULT 'not_sure',
  stable_identity text NOT NULL DEFAULT 'not_sure',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.protective_factors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own protective factors"
  ON public.protective_factors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own protective factors"
  ON public.protective_factors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own protective factors"
  ON public.protective_factors FOR UPDATE
  USING (auth.uid() = user_id);

-- Monthly briefing cache
CREATE TABLE public.monthly_briefing_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  month_key text NOT NULL,
  age_group text NOT NULL,
  bullets jsonb NOT NULL,
  protective_factor_note text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_key)
);

ALTER TABLE public.monthly_briefing_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own briefing cache"
  ON public.monthly_briefing_cache FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own briefing cache"
  ON public.monthly_briefing_cache FOR INSERT
  WITH CHECK (auth.uid() = user_id);
