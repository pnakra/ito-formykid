import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMIN_EMAILS = ["pnakra@gmail.com"];

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData.user?.email?.toLowerCase() ?? "";
    if (!ADMIN_EMAILS.includes(email)) throw new Error("Not allowed.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [ev, fb] = await Promise.all([
      (supabaseAdmin.from("events" as any) as any).select("event, source").limit(50000),
      (supabaseAdmin.from("feedback" as any) as any).select("*").order("created_at", { ascending: false }).limit(500),
    ]);
    if (ev.error || fb.error) throw new Error("Couldn't load stats.");

    const counts: Record<string, Record<string, number>> = {};
    const sources = new Set<string>();
    for (const row of ev.data as { event: string; source: string }[]) {
      sources.add(row.source);
      counts[row.event] ??= {};
      counts[row.event][row.source] = (counts[row.event][row.source] ?? 0) + 1;
    }
    return {
      sources: [...sources].sort(),
      counts,
      feedback: fb.data as {
        id: string; created_at: string; source: string; pid: string | null; sample_id: string | null;
        in_scope: string | null; safety_category: string | null; helped: string; comment: string | null;
      }[],
    };
  });
