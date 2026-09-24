import { redirect } from "@tanstack/react-router";
import { checkAccess } from "./earlyAccess.functions";

const PUBLIC = ["/early-access", "/unlock"];
let unlocked = false;

export function markUnlocked() {
  unlocked = true;
}

export async function enforceAccess(pathname: string) {
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"))) return;
  if (unlocked) return;
  const { ok } = await checkAccess();
  if (ok) {
    if (typeof window !== "undefined") unlocked = true;
    return;
  }
  throw redirect({ to: "/early-access" });
}
