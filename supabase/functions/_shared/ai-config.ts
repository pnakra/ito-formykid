// Central AI model configuration.
//
// Every model string used by the edge functions lives here so the analysis
// behaviour cannot drift between functions.
//
// ANALYSIS_MODEL — google/gemini-2.5-flash
//   Main parent-facing analysis. Long structured JSON output, needs solid
//   reasoning about culture and language, but must stay fast and cheap enough
//   to run on every scan and every refinement re-run.
//
// TRIAGE_MODEL — google/gemini-2.5-flash-lite
//   Pre-analysis safety triage. Tiny classification job on a short prompt,
//   runs before every scan, so latency and cost matter more than depth.
//
// BRIEFING_MODEL — google/gemini-2.5-pro
//   Monthly briefing. Runs rarely, needs the broadest knowledge of current
//   youth-culture trends, so the stronger model is worth it here.
//
// SUMMARY_MODEL — google/gemini-2.5-flash
//   Short summaries and suggestions from the parent's own notes.

export const ANALYSIS_MODEL = "google/gemini-2.5-flash";
export const TRIAGE_MODEL = "google/gemini-2.5-flash-lite";
export const BRIEFING_MODEL = "google/gemini-2.5-pro";
export const SUMMARY_MODEL = "google/gemini-2.5-flash";

export const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
