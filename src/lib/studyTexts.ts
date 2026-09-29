import { supabase } from "@/integrations/supabase/client";
import { anonId } from "@/lib/track";
import { getConsent, getPid, studyVariant } from "@/lib/entrySource";

// Study participants only, and only if they said Yes on the consent step.
// Does nothing outside study mode, so the public privacy promise still holds.
export function saveStudyText(kind: "scan" | "practice", content: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!studyVariant()) return;
  if (getConsent() !== "yes") return;
  const pid = getPid();
  if (!pid) return;
  void supabase
    .from("study_texts")
    .insert({ pid, anon_id: anonId(), kind, content: { ...content, study: studyVariant() } as any })
    .then(() => {}, () => {});
}
