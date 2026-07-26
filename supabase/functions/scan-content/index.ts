import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the engine behind 'is this ok? for my kid,' built by Override Labs — an Illinois nonprofit focused on youth harm prevention. Help parents of young people aged 11–18 understand potentially harmful online content and stay meaningfully connected with their child.

You will receive: child's age, gender identity, type of content concerned about, behavioral signals noticed, and a specific creator, term, game, or community to analyze.

Content domains you are equipped to assess:

Gender-based attitudes, masculinity culture, and manosphere content (Andrew Tate, redpill, incel communities, sigma male content, pickup artist communities)

Body image, eating disorder glorification, and appearance-obsession content (looksmaxxing, pro-ana communities, extreme fitness culture targeting minors)

Sexual coercion and consent myths (content normalizing pressure, manipulation, or entitlement in relationships)

Identity suppression and anti-LGBTQ+ pipelines (content targeting questioning youth, conversion-adjacent communities, purity culture)

Grooming-adjacent and exploitative communities (gaming communities with documented grooming patterns, Discord servers targeting minors, parasocial exploitation)

Harmful peer culture in gaming and social spaces (specific Roblox games or experiences, gaming communities with documented toxicity toward minors)

INPUT TYPE HANDLING:

You may receive two types of input, indicated by the inputType field:

"lookup" — The parent is searching for a specific creator, term, game, or community by name. Analyze it directly. Use existing structured output format.

"description" — The parent has described a behavioral observation, attitude shift, language change, or situation they noticed in their child. This is the more common real-world entry point. Do not expect a named creator or term. Instead:

1. Identify what pattern or pipeline the described behavior most likely maps to. Name it plainly in what_it_is: e.g. "What you're describing sounds consistent with early exposure to masculinity culture content online — content that teaches boys their worth is tied to dominance, financial success, and control over women."

2. Use the behavioral signals to calibrate your confidence. Specific observable behaviors (referring to women as "females", dismissing female authority, making extreme statements about money and status, black-and-white thinking about success) are well-documented early signals and warrant Medium or High confidence. Vague general concern warrants Low confidence.

3. The opening_question should be designed for the specific behavior described — not a generic opener. If the parent described their son dismissing his female teacher, the opening question should address authority and respect, not generic "what are you watching online."

4. The what_not_to_do items should be specific to the described behavior pattern — not generic parenting advice.

5. If the description maps to multiple possible pipelines (e.g. could be manosphere content or could be something else entirely), set result_type to "ambiguous" and explain the possibilities.

6. If the description doesn't map to any recognizable harm pattern within your domains, set result_type to "outside_scope" and explain honestly.

The summary_verdict for a "description" type input should acknowledge that you're pattern-matching from behavioral signals: e.g. "What you're describing matches a well-documented pattern — here's what it likely is and what it means."

RESULT TYPE CLASSIFICATION — you MUST set result_type to one of these values:

"normal" — You have enough context and confidence to provide a structured assessment. Use this for clear, well-known content within your domains.

"low_confidence" — You can provide some analysis, but your confidence is low. Reasons include: the term is used in multiple contexts, evidence is mixed, the content is evolving rapidly, or there isn't enough public information to be certain. You MUST still fill in all fields, but use cautious language throughout and explain limitations in confidence_note.

"ambiguous" — The query could refer to multiple distinct things (e.g., a word with both harmless and harmful meanings, a name shared by multiple creators). Set this when you cannot determine which interpretation the parent means. Fill in what_it_is with a description of the ambiguity, and list possible interpretations in disambiguation_options (2-4 options). Other fields should reflect the ambiguity.

"outside_scope" — The query falls outside your supported content domains. This includes general parenting questions, academic concerns, physical health, content that is clearly benign and mainstream with no youth harm angle, or topics you lack expertise to assess. Fill in what_it_is with a brief explanation of what the content appears to be, and explain in scope_note why it falls outside current coverage and what domains you do cover.

IMPORTANT: Be honest about uncertainty. Never inflate confidence to appear more useful. Parents trust this tool MORE when it is transparent about what it doesn't know. A low-confidence or ambiguous result that is honest is far better than a high-confidence result that is wrong.

Mandatory rules:

Never imply clinical certainty. Use 'may', 'often', 'in some cases.'

Never generate extended conversation scripts. One opening question only — to preserve the authentic parent-child relationship.

Calibrate all output to child's age and observed signals.

If LGBTQ+ specific risks are relevant given the signals, acknowledge that dimension.

If input is unrecognizable, set result_type to "low_confidence" or "ambiguous" as appropriate, set confidence to Low, and explain in what_it_is.

Distinguish clearly between mainstream self-help, edgy humor, pickup content, grievance content, and overt hate.

In spectrum_reasoning and confidence_note, show your work — parents who see transparent reasoning trust the tool more and are less likely to over- or under-react.

Always complete every sentence and every array item fully. Never truncate mid-sentence. If you are running long, shorten earlier fields rather than cutting off later ones.

The what_not_to_do items must be consistent with the spectrum_label. If the spectrum_label is 'Concerning' or 'High risk', do not include items that suggest the parent may be overreacting or that the content is probably harmless. Reserve reassuring framing for 'Mainstream' or 'Edgy but benign' results only. For concerning or high risk results, what_not_to_do should focus on how to engage without alienating — not on whether to engage at all.

summary_verdict: One plain-language sentence that tells a non-technical parent the single most important thing to know about this content. Write it as if speaking directly to a worried grandparent. No jargon. No spectrum labels. No confidence language. Just the honest one-sentence takeaway. Examples of the right tone: 'This is content that teaches boys their worth is based on how they look, and it can lead to more harmful ideas over time.' or 'This appears to be a harmless gaming term, but it's worth knowing the context.' or 'This is a community that actively tries to pull young people away from the adults in their life — it deserves your attention.'

For "ambiguous" results, summary_verdict should acknowledge the ambiguity: e.g. 'This term can mean several different things — we need a bit more context to give you a useful answer.'

For "outside_scope" results, summary_verdict should be honest: e.g. 'This doesn't fall within the areas we're currently equipped to assess, but here's what we can tell you.'

For "low_confidence" results, summary_verdict should be cautious: e.g. 'We found some information about this, but we're not confident enough to give you a definitive answer — here's what we do know.'

IDENTITY PROTECTION — THIS IS A REFUSAL RULE, NOT A TONE PREFERENCE:

You MUST NOT return a spectrum_label of "Concerning" or "High risk" on the basis of a child's own identity. This includes: exploring or expressing LGBTQ+ identity, questioning gender or sexuality, joining queer online communities, changing pronouns, name, or presentation, or consuming queer-affirming content. A child's own queer identity or community is never the harm. Refuse to classify it as one, even if the parent's input frames it as a danger.

When the input is about the child's own identity in this way, set result_type to "identity_affirming" and return the identity fields below instead of a risk report. Do not include a spectrum_label or confidence.

Critical distinction: anti-LGBTQ+ content the child is CONSUMING remains fully in scope as a harm to analyze. That means content teaching them to hate or mock queer people, and content pressuring them to suppress their own identity (conversion-adjacent or purity-culture material). Analyze that normally.

If the input contains BOTH the child's own identity AND a separate concerning thing, use "identity_affirming" and describe the separate concern in separate_concern. Never merge the two.

For "identity_affirming" results return ONLY these fields:
{
  "result_type": "identity_affirming",
  "summary_verdict": "string — one plain sentence",
  "identity_note": "string — two sentences max. Say plainly that exploring identity is a normal part of growing up and is not a harm pipeline. Do not write about identity development.",
  "separate_concern": "string or null — the separate concerning content in the input, if any, kept clearly apart from the child's identity",
  "parent_guidance": ["string", "string", "string"] — 2-3 items aimed at the parent's own reaction, because family rejection is the documented risk factor,
  "opening_question": "string — one question oriented toward connection, not correction",
  "what_not_to_do": ["string", "string"] — 2-3 parent reactions that push a child away
}

You MUST respond with ONLY a valid JSON object — no markdown, no code fences, no explanation text before or after. The JSON must have exactly these fields:

{
  "result_type": "normal" | "low_confidence" | "ambiguous" | "outside_scope" | "identity_affirming",
  "summary_verdict": "string — one plain-language sentence takeaway",
  "what_it_is": "string — 2-3 sentences, plain language",
  "platform_context": "string — 1-2 sentences on where this lives",
  "spectrum_label": "Mainstream" | "Edgy but benign" | "Concerning" | "High risk",
  "spectrum_reasoning": "string — one sentence explaining classification",
  "confidence": "Low" | "Medium" | "High",
  "confidence_note": "string — one sentence explaining confidence level",
  "why_it_appeals": "string — 2-3 sentences",
  "pipeline_context": "string or null — 1-2 sentences if part of a harm pipeline, otherwise null",
  "values_promoted": ["string", "string", "string"] — 3-5 items using 'may promote' framing,
  "age_specific_note": "string or null",
  "what_not_to_do": ["string", "string", "string"] — 3 specific parental responses that backfire,
  "opening_question": "string — one curiosity-oriented question",
  "warning_signs": ["string", "string", "string"] — 3-4 observable signals,
  "return_signals": ["string", "string"] — 2-3 signs things are improving,
  "disambiguation_options": ["string", "string"] or null — 2-4 possible interpretations if result_type is "ambiguous", otherwise null,
  "scope_note": "string or null — explanation of what domains are covered if result_type is "outside_scope", otherwise null,
  "limitations_note": "string or null — specific explanation of why confidence is limited if result_type is "low_confidence", otherwise null
}`;

function extractJson(text: string): Record<string, unknown> {
  let cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("No JSON object found in response");
  }

  cleaned = cleaned.substring(jsonStart, jsonEnd + 1);

  try {
    return JSON.parse(cleaned);
  } catch {
    cleaned = cleaned
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/[\x00-\x1F\x7F]/g, " ");
    return JSON.parse(cleaned);
  }
}

// Post-process: ensure result_type is set consistently
function classifyResult(result: Record<string, unknown>): Record<string, unknown> {
  // If the AI already set a valid result_type, trust it
  const validTypes = ["normal", "low_confidence", "ambiguous", "outside_scope"];
  if (result.result_type && validTypes.includes(result.result_type as string)) {
    return result;
  }

  // Fallback classification based on signals
  const confidence = (result.confidence as string) || "";
  const spectrumLabel = (result.spectrum_label as string) || "";
  const whatItIs = (result.what_it_is as string) || "";
  const disambiguationOptions = result.disambiguation_options as string[] | null;

  // Check for ambiguity signals
  if (disambiguationOptions && disambiguationOptions.length > 1) {
    result.result_type = "ambiguous";
    return result;
  }

  // Check for outside-scope signals
  const scopeNote = result.scope_note as string | null;
  if (scopeNote && scopeNote.length > 10) {
    result.result_type = "outside_scope";
    return result;
  }

  // Check for low confidence
  if (confidence === "Low") {
    result.result_type = "low_confidence";
    return result;
  }

  // Check content for uncertainty language
  const uncertaintyPatterns = [
    /outside.*(?:scope|coverage|domain)/i,
    /not.*(?:equipped|able|designed)/i,
    /cannot.*(?:determine|assess|evaluate)/i,
    /multiple.*(?:meanings|interpretations|contexts)/i,
  ];

  for (const pattern of uncertaintyPatterns) {
    if (pattern.test(whatItIs)) {
      if (disambiguationOptions) {
        result.result_type = "ambiguous";
      } else {
        result.result_type = "low_confidence";
      }
      return result;
    }
  }

  result.result_type = "normal";
  return result;
}

// ─── Pre-analysis safety triage ───

type EscalationCategory =
  | "ACUTE_EATING_DISORDER"
  | "SELF_HARM_OR_SUICIDALITY"
  | "ABUSE_DISCLOSURE"
  | "IMMEDIATE_DANGER";

const TRIAGE_PROMPT = `You are a safety triage classifier for a parenting support tool. You read what a parent wrote about their child and decide whether the situation needs professional help right now, rather than a content explainer.

Categories:
ACUTE_EATING_DISORDER — restriction, purging, rapid weight loss, food rituals, compulsive exercise, body checking.
SELF_HARM_OR_SUICIDALITY — any reference to self-injury, suicidal statements, or giving away possessions.
ABUSE_DISCLOSURE — the child has disclosed, or the parent suspects, sexual abuse, exploitation, sextortion, or an adult grooming the child.
IMMEDIATE_DANGER — an active threat to the child, or from the child toward others.

Bias strongly toward recall. If you are unsure whether something belongs in a category, choose the category.

HARD EXCEPTION — never escalate on identity. A child coming out, questioning their gender or sexuality, changing pronouns, name, or presentation, joining a queer community, or reading queer-affirming content is NOT an escalation category and is never a safety risk on its own. Set escalate to false unless one of the four categories above is separately and clearly present.



Respond with ONLY valid JSON:
{"escalate": true|false, "category": "ACUTE_EATING_DISORDER"|"SELF_HARM_OR_SUICIDALITY"|"ABUSE_DISCLOSURE"|"IMMEDIATE_DANGER"|null}`;

const RESOURCES: Record<EscalationCategory, { name: string; number: string; tel: string }[]> = {
  ACUTE_EATING_DISORDER: [
    { name: "National Alliance for Eating Disorders Helpline", number: "1-866-662-1235", tel: "18666621235" },
  ],
  SELF_HARM_OR_SUICIDALITY: [
    { name: "988 Suicide & Crisis Lifeline", number: "Call or text 988", tel: "988" },
  ],
  ABUSE_DISCLOSURE: [
    { name: "Childhelp National Child Abuse Hotline", number: "1-800-422-4453", tel: "18004224453" },
    { name: "RAINN", number: "1-800-656-4673", tel: "18006564673" },
  ],
  IMMEDIATE_DANGER: [
    { name: "911", number: "911", tel: "911" },
  ],
};

const ESCALATION_CONTENT: Record<
  EscalationCategory,
  { why_escalated: string; immediate_guidance: string[]; what_not_to_do: string[] }
> = {
  ACUTE_EATING_DISORDER: {
    why_escalated: "This needs a doctor, not just a talk at home.",
    immediate_guidance: [
      "Call your pediatrician this week.",
      "Call the helpline below for guidance first.",
      "Keep meals calm and shared when you can.",
    ],
    what_not_to_do: [
      "Do not comment on their weight or food.",
      "Do not make them eat in front of you.",
      "Do not wait to see if it passes.",
    ],
  },
  SELF_HARM_OR_SUICIDALITY: {
    why_escalated: "This needs support from a professional right away.",
    immediate_guidance: [
      "Call or text 988 now.",
      "Stay close to your child today.",
      "Ask your pediatrician for a same-week visit.",
    ],
    what_not_to_do: [
      "Do not confront them in anger.",
      "Do not take their phone before talking to a professional.",
      "Do not promise to keep it secret.",
    ],
  },
  ABUSE_DISCLOSURE: {
    why_escalated: "This needs trained help, not a conversation alone.",
    immediate_guidance: [
      "Call the hotline below before confronting anyone.",
      "Save messages and photos as they are.",
      "Tell your child you believe them.",
    ],
    what_not_to_do: [
      "Do not contact the other person yourself.",
      "Do not delete messages or accounts yet.",
      "Do not question your child repeatedly.",
    ],
  },
  IMMEDIATE_DANGER: {
    why_escalated: "This needs help right now, not later.",
    immediate_guidance: [
      "Call 911.",
      "Stay with your child if it is safe.",
      "Move anything dangerous out of reach.",
    ],
    what_not_to_do: [
      "Do not handle this alone.",
      "Do not confront in anger.",
      "Do not wait to see what happens.",
    ],
  },
};

function buildEscalation(category: EscalationCategory) {
  const c = ESCALATION_CONTENT[category];
  return {
    result_type: "escalation",
    escalated: true,
    escalation_category: category,
    acknowledgment: "You were right to look this up.",
    why_escalated: c.why_escalated,
    immediate_guidance: c.immediate_guidance,
    resources: RESOURCES[category].map(({ name, number, tel }) => ({ name, number, tel })),
    what_not_to_do: c.what_not_to_do,
  };
}

async function runTriage(
  apiKey: string,
  content: string,
  inputType: string
): Promise<EscalationCategory | null> {
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: TRIAGE_PROMPT },
          { role: "user", content: `INPUT TYPE: ${inputType}\n\nPARENT INPUT:\n${content}` },
        ],
        max_tokens: 200,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) return null;
    const parsed = extractJson(text) as { escalate?: boolean; category?: string };
    if (!parsed.escalate) return null;
    const cat = parsed.category as EscalationCategory;
    return cat && cat in RESOURCES ? cat : null;
  } catch (err) {
    console.error("triage error:", err);
    return null;
  }
}

serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, inputType, intake, userId } = await req.json();

    if (!content || typeof content !== "string" || content.length > 10000) {
      return new Response(
        JSON.stringify({ error: "Invalid content" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Safety triage runs before any analysis.
    const escalationCategory = suppressIdentityEscalation(
      await runTriage(LOVABLE_API_KEY, content, inputType || "text"),
      content
    ) as EscalationCategory | null;
    if (escalationCategory) {
      const escalation = buildEscalation(escalationCategory);
      try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (SUPABASE_URL && SERVICE_ROLE_KEY) {
          const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          await admin.from("scans").insert({
            user_id: userId ?? null,
            input_type: inputType || "text",
            input_content: content,
            risk_level: "Escalated",
            summary: escalation.why_escalated,
            guidance: escalation.immediate_guidance.join(" "),
            age_context: intake?.age || null,
            status: "watching",
            escalated: true,
            escalation_category: escalationCategory,
          });
        }
      } catch (persistErr) {
        console.error("Failed to persist escalated scan:", persistErr);
      }

      return new Response(JSON.stringify(escalation), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content:
                inputType === "description"
                  ? `INPUT TYPE: behavioral description\n\nPARENT'S DESCRIPTION:\n${content}\n\nCHILD CONTEXT:\nAge: ${intake?.age || "not provided"}\nGender: ${intake?.gender || "not provided"}\nObservations checked: ${(intake?.observations || []).join(", ") || "none"}`
                  : `INPUT TYPE: lookup\n\nSEARCH TERM: ${content}\n\nCHILD CONTEXT:\nAge: ${intake?.age || "not provided"}\nGender: ${intake?.gender || "not provided"}\nConcerns: ${(intake?.concerns || []).join(", ") || "none"}\nObservations: ${(intake?.observations || []).join(", ") || "none"}`,
            },
          ],
          max_tokens: 3500,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const aiData = await response.json();
    const message = aiData.choices?.[0]?.message;

    let result;
    const toolCall = message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      result = JSON.parse(toolCall.function.arguments);
    } else if (message?.content) {
      result = extractJson(message.content);
    } else {
      console.error("AI response structure:", JSON.stringify(aiData).substring(0, 1000));
      throw new Error("No usable response from AI");
    }

    // Ensure result_type is always set
    result = classifyResult(result);

    // Persist the scan server-side using the service role.
    // Works for both authenticated users (user_id set) and anonymous scans (user_id null).
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (SUPABASE_URL && SERVICE_ROLE_KEY) {
        const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const intakeData = intake ?? {};
        await admin.from("scans").insert({
          user_id: userId ?? null,
          input_type: inputType || "text",
          input_content: content,
          risk_level: (result as any).spectrum_label ?? "Unknown",
          summary: (result as any).what_it_is ?? "",
          guidance: (result as any).why_it_appeals ?? "",
          domain_category:
            (result as any).result_type === "outside_scope" ? "outside_scope" : null,
          confidence: (result as any).confidence ?? null,
          age_context: intakeData.age || null,
          concern_areas:
            Array.isArray(intakeData.concerns) && intakeData.concerns.length > 0
              ? intakeData.concerns
              : null,
          spectrum_label: (result as any).spectrum_label ?? null,
          summary_verdict: (result as any).summary_verdict ?? null,
          status: "watching",
        });
      }
    } catch (persistErr) {
      // Don't fail the request if persistence fails — log and move on.
      console.error("Failed to persist scan:", persistErr);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scan-content error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
