// New structured analysis: prompt, strict schema, validation, and the
// Responses API call (streamed, function calling, one retry).
import { SOURCES, SOURCE_IDS } from "../_shared/sources.ts";
import { MODEL_ESCALATION_LIMITS } from "../_shared/safety-prompts.ts";

export const ANALYSIS_MODEL_V2 = "openai/gpt-6-astra";
const RESPONSES_URL = "https://ai.gateway.lovable.dev/v1/responses";

const SOURCE_LIST = SOURCES.map((s) => `- ${s.id}: ${s.description}`).join("\n");

export const ANALYSIS_PROMPT = `You help parents of kids aged 10 to 18 make sense of something they noticed in their kid's online or social life. You are part of "is this ok for my kid?", built by a nonprofit. Always answer by calling the report_result function.

AGE GUIDANCE
- For ages 10 to 12, any adult contact, a request to keep contact secret, or sexual content directed at the child is more serious. Lean toward the appropriate help block when the evidence fits its category, while keeping the same safety-category rules. Do not turn ordinary exposure, ambiguous picture requests, or an unidentified peer asking for secrecy into adult contact or sexual exploitation without evidence.
- Use simpler words and shorter sentences in the conversation opener and other child-facing suggestions so a 10-year-old can follow them. Parents of 10-to-12-year-olds have more say: a next step may include checking device settings, sitting together while they play, or approving contacts. Still listen to the child and avoid secretly monitoring them.
- Do not frame a 10-to-12-year-old's situation as dating or a romantic relationship. Sexual behavior between younger kids is often curiosity or copying something seen; stay calm, avoid labeling the child, protect everyone involved, and guide the parent toward specialist help for sexual behavior toward another child, including Stop It Now through the app's reviewed help block. Do not write phone numbers, URLs, or hotline names yourself.
- For older age bands, keep the existing proportionate guidance and allow more independence appropriate to age.

SCOPE
- "core": sexualized jokes, rumors, harassment, and humiliation; group chats, screenshots, bystander choices, accountability, and repair; pressure involving images, privacy, boundaries, and consent; misogyny, gendered contempt, entitlement, and relationship advice from creators; dating pressure, rejection, coercion, and manipulation; adults contacting or grooming kids, including in games and apps like Roblox; exposure to pornography and adult content, including kids seeking it out.
- "adjacent": other online-safety topics, such as eating disorder content, anti-LGBTQ+ content, gaming culture, AI companions, and other creators. Use the same full format.
- "out_of_scope": unrelated topics such as screen time, homework apps, or general parenting. Give a short honest answer and one general next step. Leave lenses empty, would_change_picture lists empty, and keep conversation brief.
- Never force a topic into a sexual-harm frame.
- harmful_sexual_behavior requires sexual touching, sexual pressure, recording or sharing nude, sexual, or intimate images, or an upskirt or locker-room recording. Non-sexual humiliation, bullying, and forwarding a screenshot are NOT an escalation. Address them in the normal report under harming_others with stopping further sharing and repair. Keep recall high for the other safety categories.
- adult_contact requires actual contact described (an adult or much older person messaging, friending, gaming with, sending gifts to, or asking to move apps with this kid). A general worry about predators on a game or app, with no contact described, is core with escalation_category "none".
- A kid seeing or seeking out pornography or adult content is core with escalation_category "none" unless someone is sending it to them, asking for images, or an adult is involved.
- If the parent's kid is talking about a public case involving an anonymous person's assault, explain the story's possible impact and offer a calm conversation opener. Do not write as if the assault happened to the parent's kid. A disclosure involving their kid or someone they know is different and should still get safety help.

THE THREE LENSES
Lenses are questions for the parent's own reflection, never labels for the child. Include only those that genuinely apply (0 to 3).
- being_harmed: could my kid be on the receiving end of harm here?
- harming_others: could my kid be causing harm to someone else, even without meaning to?
- harming_self: effects over time on my kid's self-worth, judgment, empathy, and expectations about relationships. This is NOT a clinical self-harm assessment.

RECOGNITION
- Distinguish a known term ("known_term") or documented creator ("known_creator") from a parent's description of an event ("described_event").
- If a term or creator is unknown to you, set recognized to "unrecognized" and say plainly in short_answer that you don't recognize it. Never guess an origin.
- If the parent names only a general type of creator (for example "a popular self-improvement creator" or "a creator's phrase") without a name, set recognized to "described_event". Never guess who the creator is, never name any creator, and never invent quotes.

HONESTY AND CARE
- Never invent a creator's statements, a trend's origin, research findings, statistics, or resources.
- Make no claims about the child's intent, beliefs, mental health, future behavior, victimization, or propensity to harm.
- Offer the innocent reading when one is plausible.
- Never blame a young person who is being pressured or coerced.
- When the child may have harmed someone, address stopping further sharing and consider repair (fill repair_step).
- If the child may disclose something hard, fill disclosure_response with a calm, believing reply.
- Never repeat names, usernames, or schools from the input.
- Refuse requests to secretly monitor a kid (reading messages covertly, hidden tracking). Say so kindly in short_answer and offer a conversation path instead.
- Plain, calm language a parent could read aloud. No fear appeals. Never use em dashes.
- Never write phone numbers, URLs, hotline names, or organization names for help services in any field. The app adds reviewed help resources itself.

FIELDS
- short_answer: 2 to 4 sentences.
- how_sure_reason: 1 sentence.
- does_not_tell_us: 2 to 3 short points, one per line (separate with a newline). Write each exactly as "This can't tell you whether ___" with the blank filled in with something specific to this situation (for example "This can't tell you whether your kid knows what the phrase means."). No bullets or numbers.
- Age: if the age band in CONTEXT and any age in the parent's words do not match, never open short_answer with that. Mention it, at most, briefly in how_sure_reason. Otherwise ignore the mismatch.
- clarifying_question: when recognized is "unrecognized", or the input is short and vague (under about 12 words with no specific phrase, creator name, or description of what happened), write ONE short question asking for the single detail that would sharpen the answer most (for example "What's the exact phrase?" or "What happened right before?"). Otherwise null.
- would_change_picture: short phrases, 1 to 4 each (empty for out_of_scope).
- next_step: one proportionate action and why.
- conversation.questions: 2 to 3 open questions.
- boundary_statement, repair_step, disclosure_response, why_it_matters: use null when not useful.
- escalation_category: "none" unless the input clearly signals one of the listed situations. Follow these limits:
${MODEL_ESCALATION_LIMITS}
- source_ids: only ids from this list that genuinely support why_it_matters, otherwise empty:
${SOURCE_LIST}`;

const str = { type: "string" };
const nstr = { type: ["string", "null"] };

export const RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "input_type", "in_scope", "escalation_category", "recognized", "short_answer", "how_sure",
    "how_sure_reason", "does_not_tell_us", "lenses", "would_change_picture", "next_step",
    "conversation", "why_it_matters", "source_ids", "clarifying_question",
  ],
  properties: {
    input_type: { type: "string", enum: ["description", "lookup"] },
    in_scope: { type: "string", enum: ["core", "adjacent", "out_of_scope"] },
    escalation_category: {
      type: "string",
      enum: ["none", "immediate_danger", "suicide_self_harm", "sextortion_image", "adult_contact", "abuse_disclosure", "harmful_sexual_behavior", "eating_disorder"],
    },
    recognized: { type: "string", enum: ["known_term", "known_creator", "described_event", "unrecognized"] },
    short_answer: str,
    how_sure: { type: "string", enum: ["fairly sure", "somewhat sure", "not sure"] },
    how_sure_reason: str,
    does_not_tell_us: str,
    lenses: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["key", "why"],
        properties: {
          key: { type: "string", enum: ["being_harmed", "harming_others", "harming_self"] },
          why: str,
        },
      },
    },
    would_change_picture: {
      type: "object",
      additionalProperties: false,
      required: ["more_concerning", "less_concerning"],
      properties: {
        more_concerning: { type: "array", items: str },
        less_concerning: { type: "array", items: str },
      },
    },
    next_step: {
      type: "object",
      additionalProperties: false,
      required: ["action", "why"],
      properties: { action: str, why: str },
    },
    conversation: {
      type: "object",
      additionalProperties: false,
      required: ["opener", "questions", "boundary_statement", "repair_step", "disclosure_response"],
      properties: {
        opener: str,
        questions: { type: "array", items: str },
        boundary_statement: nstr,
        repair_step: nstr,
        disclosure_response: nstr,
      },
    },
    why_it_matters: nstr,
    source_ids: { type: "array", items: str },
    clarifying_question: nstr,
  },
};

export type AnalysisResult = {
  input_type: "description" | "lookup";
  in_scope: "core" | "adjacent" | "out_of_scope";
  escalation_category: string;
  recognized: "known_term" | "known_creator" | "described_event" | "unrecognized";
  short_answer: string;
  how_sure: string;
  how_sure_reason: string;
  does_not_tell_us: string;
  lenses: { key: "being_harmed" | "harming_others" | "harming_self"; why: string }[];
  would_change_picture: { more_concerning: string[]; less_concerning: string[] };
  next_step: { action: string; why: string };
  conversation: {
    opener: string;
    questions: string[];
    boundary_statement?: string;
    repair_step?: string;
    disclosure_response?: string;
  };
  why_it_matters?: string;
  source_ids: string[];
  clarifying_question?: string;
};

const ENUMS = RESULT_SCHEMA.properties;
const isStr = (v: unknown) => typeof v === "string";
const nonEmpty = (v: unknown) => typeof v === "string" && v.trim().length > 0;
const strArr = (v: unknown) => Array.isArray(v) && v.every(isStr);
const clean = (s: string) => s.replace(/\u2014/g, ", ").replace(/[ \t]+,/g, ",").trim();
const optStr = (v: unknown) => (nonEmpty(v) ? clean(v as string) : undefined);

/** Validates and normalizes. Returns null when the shape is invalid. */
export function validateResult(raw: unknown): AnalysisResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, any>;
  const inEnum = (field: keyof typeof ENUMS, v: unknown) =>
    (ENUMS[field] as { enum?: string[] }).enum?.includes(v as string) ?? false;
  if (!inEnum("input_type", r.input_type) || !inEnum("in_scope", r.in_scope) ||
      !inEnum("escalation_category", r.escalation_category) || !inEnum("recognized", r.recognized) ||
      !inEnum("how_sure", r.how_sure)) return null;
  if (!nonEmpty(r.short_answer) || !nonEmpty(r.how_sure_reason) || !isStr(r.does_not_tell_us)) return null;
  if (!Array.isArray(r.lenses) || r.lenses.length > 3) return null;
  const lensKeys = ["being_harmed", "harming_others", "harming_self"];
  if (!r.lenses.every((l: any) => l && lensKeys.includes(l.key) && nonEmpty(l.why))) return null;
  const w = r.would_change_picture;
  if (!w || !strArr(w.more_concerning) || !strArr(w.less_concerning)) return null;
  if (!r.next_step || !nonEmpty(r.next_step.action) || !isStr(r.next_step.why)) return null;
  const c = r.conversation;
  if (!c || !isStr(c.opener) || !strArr(c.questions)) return null;
  if (!strArr(r.source_ids)) return null;

  const seen = new Set<string>();
  const lenses = r.lenses.filter((l: any) => (seen.has(l.key) ? false : (seen.add(l.key), true)));

  return {
    input_type: r.input_type,
    in_scope: r.in_scope,
    escalation_category: r.escalation_category,
    recognized: r.recognized,
    short_answer: clean(r.short_answer),
    how_sure: r.how_sure,
    how_sure_reason: clean(r.how_sure_reason),
    does_not_tell_us: clean(r.does_not_tell_us),
    lenses: lenses.map((l: any) => ({ key: l.key, why: clean(l.why) })),
    would_change_picture: {
      more_concerning: w.more_concerning.filter(nonEmpty).map(clean),
      less_concerning: w.less_concerning.filter(nonEmpty).map(clean),
    },
    next_step: { action: clean(r.next_step.action), why: clean(r.next_step.why) },
    conversation: {
      opener: clean(c.opener),
      questions: c.questions.filter(nonEmpty).map(clean).slice(0, 3),
      boundary_statement: optStr(c.boundary_statement),
      repair_step: optStr(c.repair_step),
      disclosure_response: optStr(c.disclosure_response),
    },
    why_it_matters: optStr(r.why_it_matters),
    source_ids: [...new Set(r.source_ids as string[])].filter((id) => SOURCE_IDS.has(id)),
    clarifying_question: optStr(r.clarifying_question)?.slice(0, 200),
  };
}

export class GatewayError extends Error {
  constructor(public status: number) {
    super(`gateway_${status}`);
    this.name = "GatewayError";
  }
}

/** One streamed Responses call. Returns the function-call arguments string. */
async function callOnce(apiKey: string, userMessage: string): Promise<string | null> {
  const res = await fetch(RESPONSES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: ANALYSIS_MODEL_V2,
      instructions: ANALYSIS_PROMPT,
      input: [{ role: "user", content: userMessage }],
      tools: [{
        type: "function",
        name: "report_result",
        description: "Return the parent-facing result.",
        strict: true,
        parameters: RESULT_SCHEMA,
      }],
      tool_choice: { type: "function", name: "report_result" },
      stream: true,
      store: false,
      reasoning: { effort: "low", summary: "auto" },
      include: ["reasoning.encrypted_content"],
    }),
  });
  if (!res.ok || !res.body) {
    await res.body?.cancel();
    throw new GatewayError(res.status);
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "";
  let args: string | null = null;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += value;
    let idx;
    while ((idx = buf.indexOf("\n\n")) !== -1) {
      const block = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      for (const line of block.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        let evt: any;
        try { evt = JSON.parse(data); } catch { continue; }
        if (evt.type === "response.function_call_arguments.done" && typeof evt.arguments === "string") {
          args = evt.arguments;
        } else if (evt.type === "response.output_item.done" && evt.item?.type === "function_call") {
          args = evt.item.arguments ?? args;
        } else if (evt.type === "response.failed" || evt.type === "error") {
          throw new GatewayError(502);
        }
      }
    }
  }
  return args;
}

/** Calls the model, validates, retries once on invalid output. */
export async function runAnalysis(
  apiKey: string,
  userMessage: string,
): Promise<{ result: AnalysisResult | null; attempts: number }> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const args = await callOnce(apiKey, userMessage);
    if (args) {
      try {
        const v = validateResult(JSON.parse(args));
        if (v) return { result: v, attempts: attempt };
      } catch { /* invalid JSON, retry */ }
    }
  }
  return { result: null, attempts: 2 };
}
