import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMIN_EMAILS = ["pnakra@gmail.com"];
const SITE = "https://formykid.isthisok.app";

// Public: marks one subscriber as unsubscribed by their private token.
export const unsubscribeDinner = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("dinner_prompt_subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("unsubscribe_token", data.token)
      .is("unsubscribed_at", null);
    if (error) return { ok: false };
    return { ok: true };
  });

// Admin only: active subscribers and feedback-tap counts.
export const getDinnerAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: u } = await context.supabase.auth.getUser();
    if (!ADMIN_EMAILS.includes(u.user?.email?.toLowerCase() ?? "")) throw new Error("Not allowed.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [subs, ev] = await Promise.all([
      supabaseAdmin
        .from("dinner_prompt_subscribers")
        .select("email, age_band, unsubscribe_token, created_at")
        .is("unsubscribed_at", null)
        .order("created_at", { ascending: true })
        .limit(10000),
      (supabaseAdmin.from("events" as any) as any)
        .select("props")
        .eq("event", "dinner_prompt_feedback")
        .limit(50000),
    ]);
    if (subs.error || ev.error) throw new Error("Couldn't load.");
    // One row per email (latest signup wins).
    const byEmail = new Map<string, { email: string; age_band: string; unsubscribe_url: string }>();
    for (const s of subs.data) {
      byEmail.set(s.email, { email: s.email, age_band: s.age_band, unsubscribe_url: `${SITE}/unsubscribe?token=${s.unsubscribe_token}` });
    }
    const subscribers = [...byEmail.values()];
    const countsByBand: Record<string, number> = { "13-15": 0, "16-18": 0 };
    for (const s of subscribers) countsByBand[s.age_band] = (countsByBand[s.age_band] ?? 0) + 1;
    const feedback: Record<string, Record<string, number>> = {};
    for (const row of ev.data as { props: { week?: string; outcome?: string } }[]) {
      const w = row.props?.week ?? "unknown";
      const o = row.props?.outcome ?? "unknown";
      feedback[w] ??= {};
      feedback[w][o] = (feedback[w][o] ?? 0) + 1;
    }
    return { subscribers, countsByBand, feedback };
  });
