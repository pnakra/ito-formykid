import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

const COOKIE = "itok_access";

async function token(pw: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`itok:${pw}`));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const checkAccess = createServerFn({ method: "GET" }).handler(async () => {
  const pw = process.env["SITE_ACCESS_PASSWORD"];
  if (!pw) return { ok: false };
  return { ok: getCookie(COOKIE) === (await token(pw)) };
});

export const unlockSite = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const pw = process.env["SITE_ACCESS_PASSWORD"];
    if (!pw || data.password !== pw) return { ok: false };
    setCookie(COOKIE, await token(pw), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return { ok: true };
  });

const utm = z.string().trim().max(200).optional().nullable();
const roleValue = z.enum(["parent", "aunt_uncle", "grandparent", "educator"]);

export const joinWaitlist = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        email: z.string().trim().toLowerCase().email().max(254),
        name: z.string().trim().max(100).optional().nullable(),
        roles: z.array(roleValue).max(4).optional().nullable(),
        utm_source: utm,
        utm_medium: utm,
        utm_campaign: utm,
        utm_content: utm,
        utm_term: utm,
        referrer: z.string().max(500).optional().nullable(),
        landing_path: z.string().max(500).optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { roles, ...rest } = data;
    const { data: inserted, error } = await supabaseAdmin
      .from("waitlist_signups")
      .upsert(
        {
          ...rest,
          roles: roles && roles.length > 0 ? roles : null,
          name: data.name || null,
          user_agent: (getRequestHeader("user-agent") ?? "").slice(0, 300),
        },
        { onConflict: "email", ignoreDuplicates: true },
      )
      .select("id, created_at");
    if (error) {
      console.error("waitlist insert failed", error);
      return { ok: false };
    }
    const row = inserted?.[0];
    if (row) {
      try {
        const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
        const labels: Record<string, string> = {
          parent: "I have kids",
          aunt_uncle: "Aunt, uncle, or pibling",
          grandparent: "I have grandkids",
          educator: "Educator or coach",
        };
        await sendTemplateEmail("new-signup-alert", "priya@overridelabsprevention.org", {
          idempotencyKey: `new-signup-alert-${row.id}`,
          templateData: {
            email: data.email,
            roles: (roles ?? []).map((r) => labels[r] ?? r).join(", "),
            source: data.utm_source ?? "",
            campaign: data.utm_campaign ?? "",
            signedUpAt: new Date(row.created_at).toLocaleString("en-US", {
              timeZone: "America/Chicago",
              dateStyle: "medium",
              timeStyle: "short",
            }) + " CT",
          },
        });
      } catch (e) {
        console.error("signup alert email failed", e);
      }
    }
    return { ok: true };
  });

export const getWaitlistCount = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error } = await supabaseAdmin
      .from("waitlist_signups")
      .select("email", { count: "exact", head: true });
    if (error) {
      console.error("waitlist count failed", error);
      return { count: 0 };
    }
    return { count: count ?? 0 };
  },
);
