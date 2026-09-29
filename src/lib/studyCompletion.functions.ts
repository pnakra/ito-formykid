import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Notifies the team when a study participant finishes the final questionnaire.
 * Fixed template + fixed recipient; the browser only passes identifiers.
 * Failures are swallowed client-side — the study submission itself already saved.
 */
export const notifyStudyCompletion = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        pid: z.string().max(200).nullable(),
        anonId: z.string().max(200),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    const completedAt = new Date().toLocaleString("en-US", {
      timeZone: "America/Chicago",
      dateStyle: "medium",
      timeStyle: "short",
    });
    try {
      await sendTemplateEmail("study-completion-alert", "", {
        templateData: { pid: data.pid, anonId: data.anonId, completedAt },
        idempotencyKey: `study-completion-${data.anonId}`,
      });
    } catch (e) {
      console.error("[study] completion email failed:", e instanceof Error ? e.message : "unknown");
    }
    return { ok: true };
  });
