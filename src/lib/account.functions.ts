import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Deletes every row the caller owns, then the auth user. The caller is
// identified only from their verified token, never from request data.
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const tables = [
      ["scan_notes", "user_id"],
      ["scans", "user_id"],
      ["situation_log", "user_id"],
      ["protective_factors", "user_id"],
      ["monthly_briefing_cache", "user_id"],
      ["subscriptions", "user_id"],
      ["profiles", "id"],
    ] as const;
    for (const [table, col] of tables) {
      const { error } = await (supabaseAdmin.from(table as any) as any).delete().eq(col, userId);
      if (error) throw new Error("We couldn't delete your data. Please try again.");
    }
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error("We couldn't delete your account. Please try again.");
    return { ok: true };
  });
