import { supabase } from "@/integrations/supabase/client";
import { anonId, currentSource } from "@/lib/track";

// Every lookup is saved so we can check the AI is answering well.
// No name or email is attached unless the person is signed in. Kept 1 year.
export function saveLookup(row: {
  id: string;
  userId?: string | null;
  inputType: string;
  queryText: string;
  intake: Record<string, unknown>;
  response: Record<string, unknown> | null;
}) {
  if (typeof window === "undefined") return;
  void supabase
    .from("lookups")
    .insert({
      id: row.id,
      anon_id: anonId(),
      user_id: row.userId ?? null,
      source: currentSource(),
      input_type: row.inputType,
      query_text: row.queryText.slice(0, 4000),
      intake: row.intake as any,
      response: row.response as any,
    })
    .then(() => {}, () => {});
}
