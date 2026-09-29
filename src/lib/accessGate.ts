import { redirect } from "@tanstack/react-router";
import { checkAccess, grantStudyAccess } from "./earlyAccess.functions";
import { LAUNCH_OPEN } from "@/config/features";

const PUBLIC = ["/early-access", "/unlock", "/help"];
let unlocked = false;

export function markUnlocked() {
  unlocked = true;
}

export async function enforceAccess(pathname: string, search?: Record<string, unknown>) {
  if (LAUNCH_OPEN) return;
  // Preview/dev builds are never gated, so every page can be reviewed.
  if (import.meta.env.DEV) return;
  if (typeof window !== "undefined" && window.location.hostname.includes("id-preview")) return;
  if (pathname.startsWith("/lovable/")) return;
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"))) return;
  if (unlocked) return;
  // Prolific participants get in without the password.
  if (pathname === "/start" && search?.src === "prolific") {
    await grantStudyAccess();
    if (typeof window !== "undefined") unlocked = true;
    return;
  }
  const { ok } = await checkAccess();
  if (ok) {
    if (typeof window !== "undefined") unlocked = true;
    return;
  }
  throw redirect({ to: "/early-access" });
}
