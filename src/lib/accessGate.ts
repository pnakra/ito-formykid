import { redirect } from "@tanstack/react-router";
import { checkAccess, grantStudyAccess } from "./earlyAccess.functions";
import { LAUNCH_OPEN } from "@/config/features";

const PUBLIC = ["/early-access", "/unlock", "/help", "/privacy", "/unsubscribe"];
let unlocked = false;

export function markUnlocked() {
  unlocked = true;
}

export async function enforceAccess(
  pathname: string,
  search?: Record<string, unknown>,
  href?: string,
) {
  if (LAUNCH_OPEN) return;
  // Preview/dev builds are never gated, so every page can be reviewed.
  if (import.meta.env.DEV) return;
  const previewLocation = typeof window !== "undefined" ? window.location.href : href;
  if (
    previewLocation &&
    /(?:id-preview--[^./]+\.lovable\.app|\.lovableproject\.com)(?:[/:]|$)/i.test(previewLocation)
  ) return;
  if (pathname.startsWith("/lovable/")) return;
  // Anyone who opens /start gets in without the password (study or not).
  void search;
  if (pathname === "/start") {
    await grantStudyAccess();
    if (typeof window !== "undefined") unlocked = true;
    return;
  }
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"))) return;
  if (unlocked) return;
  const { ok } = await checkAccess();
  if (ok) {
    if (typeof window !== "undefined") unlocked = true;
    return;
  }
  throw redirect({ to: "/early-access" });
}
