import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    if (action === "monthly_briefing") {
      const { ageGroup } = params;
      if (!ageGroup) {
        return new Response(JSON.stringify({ error: "ageGroup required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: "You are an expert on youth online safety and digital culture trends. You work for 'is this ok? for parents,' an Illinois nonprofit. Be plain-spoken, non-alarmist, and practical." },
            { role: "user", content: `Generate a brief monthly parent briefing for parents of ${ageGroup}-year-olds. Cover 3-4 content trends, creator types, community patterns, or language shifts currently circulating among this age group online that parents should be aware of. Focus on: gender-based attitudes and masculinity culture, body image and eating disorder content, sexual coercion and consent myths, identity suppression or anti-LGBTQ+ pipelines, grooming-adjacent communities, harmful gaming or social peer culture. Plain language, no jargon. Each bullet 1-2 sentences. End with one protective-factor note — something parents can do proactively this month.` },
          ],
          tools: [{
            type: "function",
            function: {
              name: "monthly_briefing",
              description: "Return a monthly parent briefing",
              parameters: {
                type: "object",
                properties: {
                  bullets: { type: "array", items: { type: "string" }, description: "3-4 trend bullets" },
                  protective_factor_note: { type: "string", description: "One proactive thing parents can do this month" },
                },
                required: ["bullets", "protective_factor_note"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "monthly_briefing" } },
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("AI request failed");
      }

      const aiData = await response.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall?.function?.arguments) throw new Error("No response from AI");
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "pattern_summary") {
      const { notes } = params;
      if (!notes || !Array.isArray(notes) || notes.length < 3) {
        return new Response(JSON.stringify({ error: "At least 3 notes required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const notesText = notes.map((n: any) => `[${n.date}] ${n.category ? `(${n.category}) ` : ""}${n.text}`).join("\n");

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You help parents track behavioral patterns in their children. Be measured, non-alarmist, and empathetic. Do not diagnose." },
            { role: "user", content: `A parent has logged the following observations about their child over time:\n${notesText}\n\nIn 2-3 plain sentences, summarize what pattern these observations suggest and what might be worth paying attention to. Be measured and non-alarmist. Do not diagnose.` },
          ],
          tools: [{
            type: "function",
            function: {
              name: "summarize_pattern",
              description: "Summarize a pattern from parent observations",
              parameters: {
                type: "object",
                properties: {
                  pattern_summary: { type: "string" },
                },
                required: ["pattern_summary"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "summarize_pattern" } },
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("AI request failed");
      }

      const aiData = await response.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall?.function?.arguments) throw new Error("No response from AI");
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "protective_suggestions") {
      const { factors } = params;
      if (!factors || !Array.isArray(factors) || factors.length === 0) {
        return new Response(JSON.stringify({ error: "factors required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const factorsList = factors.join(", ");

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You help parents strengthen protective factors for their children. Be practical, non-judgmental, and specific." },
            { role: "user", content: `A parent has flagged the following protective factors as needing attention: ${factorsList}. Give one concrete, practical suggestion for each — plain language, non-judgmental, actionable this week.` },
          ],
          tools: [{
            type: "function",
            function: {
              name: "suggest_improvements",
              description: "Return suggestions for protective factors",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        factor: { type: "string" },
                        suggestion: { type: "string" },
                      },
                      required: ["factor", "suggestion"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["suggestions"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "suggest_improvements" } },
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("AI request failed");
      }

      const aiData = await response.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall?.function?.arguments) throw new Error("No response from AI");
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("home-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
