import { supabase } from "@/integrations/supabase/client";
import { anonId } from "@/lib/track";
import { getPid } from "@/lib/entrySource";

// Study participants only: saves what they typed (scan text, practice chat).
// Does nothing outside study mode, so the public privacy promise still holds.
export function saveStudyText(kind: "scan" | "practice", content: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem("itok_src") !== "prolific") return;
  const pid = getPid();
  if (!pid) return;
  void supabase
    .from("study_texts")
    .insert({ pid, anon_id: anonId(), kind, content: content as any })
    .then(() => {}, () => {});
}
