import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// This check is made with the verified session, not a browser-supplied email.
export const getAdminEvalAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.auth.getUser();
    if (error || data.user?.email?.toLowerCase() !== "pnakra@gmail.com") {
      throw new Error("Not allowed.");
    }
    return { allowed: true };
  });
