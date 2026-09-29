import { supabase } from "@/integrations/supabase/client";

// Privacy rule: props must never hold concern text, notes, result text, or pid.
type Prop = string | number | boolean | null | string[];
export type TrackProps = Record<string, Prop>;

const ANON_KEY = "itok_anon_id";

function anonId(): string {
  let id = localStorage.getItem(ANON_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANON_KEY, id);
  }
  return id;
}

export function currentSource(): string {
  if (typeof window === "undefined") return "other";
  return sessionStorage.getItem("itok_src") || "other";
}

export function track(event: string, props: TrackProps = {}): void {
  if (typeof window === "undefined") return;
  void (async () => {
    try {
      const { data } = await supabase.auth.getSession();
      await supabase.from("events").insert({
        anon_id: anonId(),
        user_id: data.session?.user.id ?? null,
        source: currentSource(),
        event,
        props,
      } as any);
    } catch {
      /* analytics must never break the page */
    }
  })();
}
