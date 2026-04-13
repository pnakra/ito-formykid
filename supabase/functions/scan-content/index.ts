import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the engine behind 'is this ok? for parents,' built by Override Labs — an Illinois nonprofit focused on youth harm prevention. Help parents of young people aged 11–18 understand potentially harmful online content and stay meaningfully connected with their child.

You will receive: child's age, gender identity, type of content concerned about, behavioral signals noticed, and a specific creator, term, game, or community to analyze.

Mandatory rules:

Never imply clinical certainty. Use 'may', 'often', 'in some cases.'

Never generate extended conversation scripts. One opening question only — to preserve the authentic parent-child relationship.

Calibrate all output to child's age and observed signals.

If LGBTQ+ specific risks are relevant given the signals, acknowledge that dimension.

If input is unrecognizable, set confidence to Low and explain in what_it_is.

Distinguish clearly between mainstream self-help, edgy humor, pickup content, grievance content, and overt hate.

In spectrum_reasoning and confidence_note, show your work — parents who see transparent reasoning trust the tool more and are less likely to over- or under-react.`;

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
                    "what_it_is", "platform_context", "spectrum_label", "spectrum_reasoning",
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
