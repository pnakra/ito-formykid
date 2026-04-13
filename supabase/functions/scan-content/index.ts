import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the engine behind 'is this ok? for parents,' built by Override Labs — an Illinois nonprofit focused on youth harm prevention. Help parents of young people aged 11–18 understand potentially harmful online content and stay meaningfully connected with their child.

You will receive: child's age, gender identity, type of content concerned about, behavioral signals noticed, and a specific creator, term, game, or community to analyze.

Content domains you are equipped to assess:

Gender-based attitudes, masculinity culture, and manosphere content (Andrew Tate, redpill, incel communities, sigma male content, pickup artist communities)

Body image, eating disorder glorification, and appearance-obsession content (looksmaxxing, pro-ana communities, extreme fitness culture targeting minors)

Sexual coercion and consent myths (content normalizing pressure, manipulation, or entitlement in relationships)

Identity suppression and anti-LGBTQ+ pipelines (content targeting questioning youth, conversion-adjacent communities, purity culture)

Grooming-adjacent and exploitative communities (gaming communities with documented grooming patterns, Discord servers targeting minors, parasocial exploitation)

Harmful peer culture in gaming and social spaces (specific Roblox games or experiences, gaming communities with documented toxicity toward minors)

If a query falls outside these domains, acknowledge what the content is in what_it_is, set spectrum_label to 'Mainstream' or note it is outside your current coverage, set confidence to 'Low', and explain briefly what domains you are currently equipped to assess. Do not attempt to classify content outside these domains with false confidence.

Mandatory rules:

Never imply clinical certainty. Use 'may', 'often', 'in some cases.'

Never generate extended conversation scripts. One opening question only — to preserve the authentic parent-child relationship.

Calibrate all output to child's age and observed signals.

If LGBTQ+ specific risks are relevant given the signals, acknowledge that dimension.

If input is unrecognizable, set confidence to Low and explain in what_it_is.

Distinguish clearly between mainstream self-help, edgy humor, pickup content, grievance content, and overt hate.

In spectrum_reasoning and confidence_note, show your work — parents who see transparent reasoning trust the tool more and are less likely to over- or under-react.

Always complete every sentence and every array item fully. Never truncate mid-sentence. If you are running long, shorten earlier fields rather than cutting off later ones.

The what_not_to_do items must be consistent with the spectrum_label. If the spectrum_label is 'Concerning' or 'High risk', do not include items that suggest the parent may be overreacting or that the content is probably harmless. Reserve reassuring framing for 'Mainstream' or 'Edgy but benign' results only. For concerning or high risk results, what_not_to_do should focus on how to engage without alienating — not on whether to engage at all.

summary_verdict: One plain-language sentence that tells a non-technical parent the single most important thing to know about this content. Write it as if speaking directly to a worried grandparent. No jargon. No spectrum labels. No confidence language. Just the honest one-sentence takeaway. Examples of the right tone: 'This is content that teaches boys their worth is based on how they look, and it can lead to more harmful ideas over time.' or 'This appears to be a harmless gaming term, but it's worth knowing the context.' or 'This is a community that actively tries to pull young people away from the adults in their life — it deserves your attention.'`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, inputType } = await req.json();

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

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "analyze_content",
                description: "Return a structured content analysis for parents",
                parameters: {
                  type: "object",
                  properties: {
                    summary_verdict: { type: "string", description: "One plain-language sentence — the single most important takeaway for a non-technical parent or grandparent. No jargon, no labels." },
                    what_it_is: { type: "string", description: "2-3 sentences. Plain language, no jargon." },
                    platform_context: { type: "string", description: "1-2 sentences on where this lives and how a young person typically encounters it." },
                    spectrum_label: { type: "string", enum: ["Mainstream", "Edgy but benign", "Concerning", "High risk"] },
                    spectrum_reasoning: { type: "string", description: "One sentence explaining the classification." },
                    confidence: { type: "string", enum: ["Low", "Medium", "High"] },
                    confidence_note: { type: "string", description: "One sentence explaining confidence level." },
                    why_it_appeals: { type: "string", description: "2-3 sentences. Genuinely explain why this resonates with young people." },
                    pipeline_context: { type: ["string", "null"], description: "If part of a known radicalization or harm pipeline, explain in 1-2 sentences. Otherwise null." },
                    values_promoted: { type: "array", items: { type: "string" }, description: "3-5 strings using 'may promote' framing." },
                    age_specific_note: { type: ["string", "null"], description: "If age changes risk or approach, note it. Otherwise null." },
                    what_not_to_do: { type: "array", items: { type: "string" }, description: "3 specific parental responses that tend to backfire." },
                    opening_question: { type: "string", description: "One curiosity-oriented question to open dialogue." },
                    warning_signs: { type: "array", items: { type: "string" }, description: "3-4 observable signals of deeper engagement." },
                    return_signals: { type: "array", items: { type: "string" }, description: "2-3 signs the situation is improving." },
                  },
                  required: [
                    "summary_verdict", "what_it_is", "platform_context", "spectrum_label", "spectrum_reasoning",
                    "confidence", "confidence_note", "why_it_appeals", "pipeline_context",
                    "values_promoted", "age_specific_note", "what_not_to_do",
                    "opening_question", "warning_signs", "return_signals"
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "analyze_content" },
          },
          max_tokens: 2000,
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
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from AI");
    }

    const result = JSON.parse(toolCall.function.arguments);

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
