import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, inputType } = await req.json();

    if (!content || typeof content !== "string" || content.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Invalid content" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a child safety content analyst for "is this ok?" — a warm, calm orientation tool for parents. You help parents understand content their child may be consuming online.

You will receive either a URL or a text description of online content. Analyze it for potential harm to teens, specifically around:
- Sexual content, sexualization, or non-consensual themes
- Coercion, manipulation, or grooming patterns
- Normalization of unhealthy relationship dynamics
- Explicit violence or self-harm content
- Hate speech or extremist content

Respond with a JSON object using this exact structure:
{
  "risk_level": "low" | "concerning" | "high" | "unknown",
  "summary": "A 2-3 sentence plain-language summary of what this content is and why it matters. Write as if speaking warmly to a parent.",
  "guidance": "A 2-4 sentence orientation for the parent. Not a script — just gentle direction on how they might approach a conversation with their teen about this content. Be warm, non-alarmist, and empowering."
}

If you cannot determine the content (e.g. the URL is unfamiliar or the description is vague), use risk_level "unknown" and explain what you can and can't assess.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation outside the JSON.`;

    const userMessage = inputType === "url"
      ? `Please analyze this URL that a teen may be consuming: ${content}`
      : `Please analyze this content/description that a teen may be encountering: ${content}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "analyze_content",
                description: "Return a content safety analysis for parents",
                parameters: {
                  type: "object",
                  properties: {
                    risk_level: {
                      type: "string",
                      enum: ["low", "concerning", "high", "unknown"],
                    },
                    summary: { type: "string" },
                    guidance: { type: "string" },
                  },
                  required: ["risk_level", "summary", "guidance"],
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
