import { supabase } from "@/integrations/supabase/client";
import { anonId } from "@/lib/track";
import { getPid } from "@/lib/entrySource";

export type StudyPageKey = "screener" | "joke" | "screenshot" | "image" | "live";

// Never pass concern text here — only the participant's answers to study questions.
export async function saveStudyAnswers(page_key: StudyPageKey, answers: Record<string, string>) {
  const { error } = await supabase.from("study_answers").insert({
    pid: getPid(),
    anon_id: anonId(),
    page_key,
    answers,
  });
  return !error;
}
