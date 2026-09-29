CREATE TABLE public.study_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pid text,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_parent_11_18 text CHECK (is_parent_11_18 IN ('yes','no')),
  tool_purpose text CHECK (char_length(tool_purpose) <= 3000),
  could_not_tell text CHECK (char_length(could_not_tell) <= 3000),
  tone_rating smallint CHECK (tone_rating BETWEEN 1 AND 5),
  would_use_words text CHECK (would_use_words IN ('yes','yes_with_edits','no')),
  would_use_words_why text CHECK (char_length(would_use_words_why) <= 3000),
  vs_google_chatgpt text CHECK (char_length(vs_google_chatgpt) <= 3000),
  problem_wording text CHECK (char_length(problem_wording) <= 3000),
  helped_decide text CHECK (helped_decide IN ('yes','somewhat','no')),
  CHECK (char_length(pid) <= 100)
);
GRANT INSERT ON public.study_responses TO anon, authenticated;
GRANT ALL ON public.study_responses TO service_role;
ALTER TABLE public.study_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit study responses" ON public.study_responses FOR INSERT TO anon, authenticated WITH CHECK (true);