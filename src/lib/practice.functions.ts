import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { preCheck } from "../../supabase/functions/_shared/safetyPatterns";

const input = z.object({
  messages: z.array(z.object({ parent: z.string().trim().min(1).max(500), teen: z.string().max(500).optional() })).min(1).max(3),
});
const RATE_MESSAGE = "You've run a lot of checks in a short time. Please wait a few minutes and try again.";
const prompt = `You simulate a fictional 14-year-old who repeated a demeaning joke about girls and said everyone says it. This is a three-turn practice for a parent. Reply in 1 to 2 short, realistic sentences. Be a bit defensive at first; ease up if the parent is curious and calm. Never give the parent advice. Never bring up sexual content or self-harm. Do not claim to be a real child.
On turn three, do not write a teen reply. Instead give 2 to 3 short lines of feedback on what went well and one thing to try. Judge: stays calm, asks before lecturing, names the boundary clearly, invites the teen's view, avoids labeling the kid. Be kind and specific; never shame the parent. Use plain, warm language a parent can understand.
Return ONLY JSON with exactly one key: "teen" (a string for turns one and two), OR "feedback" (an array of 2 to 3 short strings for turn three). No markdown.`;

export const practiceTurn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => input.parse(data))
  .handler(async ({ data }) => {
    const requestId = randomUUID();
    const started = Date.now();
    const log = (status: number, errorType: string | null = null, category: string | null = null) => {
      console.log(JSON.stringify({ request_id: requestId, category, latency_ms: Date.now() - started, status, error_type: errorType }));
    };
    // Only the parent's words are accepted for the model. Never save or log a transcript.
    const parentWords = data.messages.map((m) => m.parent);
    if (data.messages.some((m) => preCheck(m.parent) || (m.teen && preCheck(m.teen)))) {
      log(200, null, "safety_precheck");
      return { kind: "safety" as const };
    }
    const ip = getRequestHeader("cf-connecting-ip") || getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() || getRequestHeader("x-real-ip") || "unknown";
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const hash = createHash("sha256").update(`itok-rl:${ip}`).digest("hex");
      const { data: verdict, error } = await supabaseAdmin.rpc("check_scan_rate_limit", { _ip_hash: hash });
      if (error) { log(503, "rate_limit_check_failed"); return { kind: "error" as const, message: "Please try again in a moment." }; }
      if (verdict !== "ok") { log(429, "rate_limited"); return { kind: "error" as const, message: RATE_MESSAGE }; }
      const key = process.env['LOVABLE_API_KEY'];
      if (!key) { log(503, "missing_api_key"); return { kind: "error" as const, message: "Practice is not ready right now." }; }
      const provider = createOpenAI({
        baseURL: "https://ai.gateway.lovable.dev/v1",
        apiKey: key,
        headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      });
      const turn = data.messages.length;
      const transcript = data.messages.map((m, i) => `Turn ${i + 1}\nParent: ${m.parent}${i < turn - 1 ? `\nTeen: ${m.teen ?? ""}` : ""}`).join("\n\n");
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        system: prompt,
        messages: [{ role: "user", content: `Turn ${turn} of 3. ${turn === 3 ? "Give feedback only." : "Give the teen's reply only."}\n${transcript}` }],
        providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
      });
      const text = await result.text;
      const parsed = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
      if (turn === 3 && Array.isArray(parsed.feedback) && parsed.feedback.length >= 2 && parsed.feedback.length <= 3 && parsed.feedback.every((s: unknown) => typeof s === "string" && s.length <= 250)) {
        log(200, null, "feedback");
        return { kind: "feedback" as const, lines: parsed.feedback as string[] };
      }
      if (turn < 3 && typeof parsed.teen === "string" && parsed.teen.length > 0 && parsed.teen.length <= 500 && !preCheck(parsed.teen)) {
        log(200, null, "teen_reply");
        return { kind: "reply" as const, teen: parsed.teen as string };
      }
      log(502, "invalid_model_output");
      return { kind: "error" as const, message: "Practice stopped. Please try again." };
    } catch (err) {
      const status = typeof err === "object" && err && "statusCode" in err ? Number(err.statusCode) : 502;
      log(status, "gateway_or_service_error");
      return { kind: "error" as const, message: status === 429 ? RATE_MESSAGE : err instanceof Error && status >= 400 && status < 500 ? err.message : "Practice is not ready right now." };
    }
  });