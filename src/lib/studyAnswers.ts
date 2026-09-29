import { supabase } from "@/integrations/supabase/client";
import { anonId } from "@/lib/track";
import { getPid } from "@/lib/entrySource";

export type StudyPageKey = "screener" | "consent" | "joke" | "screenshot" | "image" | "live" | "own1" | "own2";

// Never pass concern text here — only the participant's answers to study questions.
// Tries twice so a brief network blip doesn't lose an answer.
export async function saveStudyAnswers(page_key: StudyPageKey, answers: Record<string, string>) {
  const row = { pid: getPid(), anon_id: anonId(), page_key, answers };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { error } = await supabase.from("study_answers").insert(row);
      if (!error) return true;
    } catch {
      /* retry below */
    }
    if (attempt === 0) await new Promise((r) => setTimeout(r, 800));
  }
  return false;
}
