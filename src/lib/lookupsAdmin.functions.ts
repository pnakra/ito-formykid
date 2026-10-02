import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMIN_EMAILS = ["pnakra@gmail.com"];

// Admin only: recent lookups with any feedback left on them.
export const getLookupsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: u } = await context.supabase.auth.getUser();
    if (!ADMIN_EMAILS.includes(u.user?.email?.toLowerCase() ?? "")) throw new Error("Not allowed.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [lk, fb] = await Promise.all([
      supabaseAdmin
        .from("lookups")
        .select("id, created_at, anon_id, source, input_type, query_text, intake, response")
        .order("created_at", { ascending: false })
        .limit(5000),
      supabaseAdmin.from("feedback").select("lookup_id, helped, comment").not("lookup_id", "is", null).limit(10000),
    ]);
    if (lk.error || fb.error) throw new Error("Couldn't load.");
    const fbBy = new Map<string, { helped: string; comment: string | null }>();
    for (const f of fb.data) if (f.lookup_id) fbBy.set(f.lookup_id, { helped: f.helped, comment: f.comment });
    return lk.data.map((l) => {
      const r = (l.response ?? {}) as Record<string, any>;
      return {
        id: l.id,
        created_at: l.created_at,
        anon_id: l.anon_id ?? "",
        source: l.source,
        input_type: l.input_type,
        query_text: l.query_text,
        intake: JSON.stringify(l.intake ?? {}),
        safety_category: (r.safety_category as string) ?? "",
        safety_source: (r.safety_source as string) ?? "",
        in_scope: (r.in_scope as string) ?? "",
        short_answer: (r.short_answer as string) ?? "",
        help_block_shown: r.help_block_shown ? "yes" : "no",
        helped: fbBy.get(l.id)?.helped ?? "",
        feedback_comment: fbBy.get(l.id)?.comment ?? "",
      };
    });
  });
