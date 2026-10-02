import { saveStudyText } from "@/lib/studyTexts";
import { saveLookup } from "@/lib/lookups";
import { DIGEST_SIGNUP_ENABLED } from "@/config/features";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EscalationResult, type EscalationResultData } from "@/components/EscalationResult";
import { IdentityResult, type IdentityResultData } from "@/components/IdentityResult";
import { SHOW_RISK_SPECTRUM } from "@/config/features";
import { useIsStudy, useStudyVariant } from "@/lib/entrySource";
import { getTasks } from "@/lib/studyTasks";
import { ReportV2, type ReportV2Data } from "@/components/ReportV2";
import { SafetyHelpBlock } from "@/components/SafetyHelpBlock";
import { isSafetyCategory } from "@/content/safetyCopy";
import { FeedbackBox } from "@/components/FeedbackBox";
import { QuickQuestions } from "@/components/QuickQuestions";
import { LIVE_QS, OWN_QS } from "@/content/studyQuestions";
import { track } from "@/lib/track";


export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Your report — is this ok for my kid?" },
      { name: "description", content: "Your parent briefing — what it is, why it matters, and how to talk about it." },
      { property: "og:title", content: "Your report — is this ok for my kid?" },
      { property: "og:description", content: "Your parent briefing — what it is, why it matters, and how to talk about it." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://formykid.isthisok.app/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://formykid.isthisok.app/og-image.png" },
    ],
  }),
  component: ResultsPage,
});

type ResultType = "normal" | "low_confidence" | "ambiguous" | "outside_scope" | "not_enough_signal";

interface ScanResult {
  result_type: ResultType;
  summary_verdict: string;
  what_it_is: string;
  platform_context: string;
  spectrum_label: "Mainstream" | "Edgy but benign" | "Concerning" | "High risk" | "Not enough signal";
  spectrum_reasoning: string;
  confidence: "Low" | "Medium" | "High";
  confidence_note: string;
  why_it_appeals: string;
  pipeline_context: string | null;
  values_promoted: string[];
  age_specific_note: string | null;
  normalization_line?: string | null;
  what_not_to_do: string[];
  opening_question: string;
  warning_signs: string[];
  return_signals: string[];
  disambiguation_options: string[] | null;
  scope_note: string | null;
  limitations_note: string | null;
  what_we_can_say?: string | null;
  what_would_help?: string | null;
}

interface IntakeData {
  age: string;
  inputMode?: "describe" | "lookup";
  age_band?: string;
  where?: string;
  frequency?: string;
  question_on_mind?: string;
  danger_now?: string;
  concerns: string[];
  observations: string[];
  query: string;
  extra_detail?: string;
}

const PROGRESS_LINES = [
  "This takes about 15 seconds.",
  "Looking at what this usually means.",
  "Writing it in plain words.",
];

const SPECTRUM_POSITIONS: Record<string, number> = {
  "Mainstream": 10,
  "Edgy but benign": 35,
  "Concerning": 65,
  "High risk": 88,
  "Not enough signal": 0,
};


function ResultsPage() {
  const studyMode = useIsStudy();
  const variant = useStudyVariant();
  const [ownKey, setOwnKey] = useState<"own1" | "own2">("own1");
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [escalation, setEscalation] = useState<EscalationResultData | null>(null);
  const [showAnyway, setShowAnyway] = useState(false);
  const [identity, setIdentity] = useState<IdentityResultData | null>(null);

  const [intake, setIntake] = useState<IntakeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDigest, setShowDigest] = useState(false);
  const [digestEmail, setDigestEmail] = useState("");
  const [digestName, setDigestName] = useState("");
  const [digestSubmitted, setDigestSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lookupId, setLookupId] = useState<string | null>(null);

  const [progressStep, setProgressStep] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => setProgressStep((n) => Math.min(n + 1, PROGRESS_LINES.length - 1)), 4500);
    return () => clearInterval(timer);
  }, [loading]);

  const progressLine = PROGRESS_LINES[progressStep];
  const progressPct = ((progressStep + 1) / PROGRESS_LINES.length) * 100;

  useEffect(() => {
    const stored = sessionStorage.getItem("scanIntake");
    if (!stored) {
      navigate({ to: "/scan" });
      return;
    }

    const intakeData: IntakeData = JSON.parse(stored);
    setOwnKey(getTasks().own1 ? "own2" : "own1");
    setIntake(intakeData);
    runScan(intakeData);
  }, []);

  const runScan = async (intakeData: IntakeData & { inputMode?: "describe" | "lookup" }) => {
    setShowAnyway(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const isDescribe = intakeData.inputMode === "describe";

      const contextParts: string[] = [];
      if (intakeData.age_band) contextParts.push(`Child's age band: ${intakeData.age_band}`);
      else if (intakeData.age) contextParts.push(`Child's age: ${intakeData.age}`);
      if (intakeData.where) contextParts.push(`Where this came up: ${intakeData.where}`);
      if (intakeData.frequency) contextParts.push(`How often: ${intakeData.frequency}`);
      if (intakeData.question_on_mind) contextParts.push(`Parent's question: ${intakeData.question_on_mind}`);
      if (intakeData.concerns?.length) contextParts.push(`Type of content concerned about: ${intakeData.concerns.join(", ")}`);
      if (intakeData.observations?.length) contextParts.push(`Behavioral signals noticed: ${intakeData.observations.join(", ")}`);
      if (intakeData.extra_detail) contextParts.push(`Other context: ${intakeData.extra_detail}`);
      if (!isDescribe) {
        contextParts.push(`Specific thing to analyze: ${intakeData.query.trim()}`);
      } else {
        contextParts.push(`Parent's description of what they noticed: ${intakeData.query.trim()}`);
      }

      const content = contextParts.join("\n");

      // Only send known fields. Gender is never sent.
      const intakePayload = {
        query: intakeData.query,
        inputMode: intakeData.inputMode,
        age: intakeData.age || undefined,
        age_band: intakeData.age_band || undefined,
        where: intakeData.where || undefined,
        frequency: intakeData.frequency || undefined,
        question_on_mind: intakeData.question_on_mind || undefined,
        danger_now: intakeData.danger_now || undefined,
        concerns: intakeData.concerns ?? [],
        observations: intakeData.observations ?? [],
        extra_detail: intakeData.extra_detail || undefined,
      };

      track("concern_submitted", {
        age_band: intakeData.age_band || null,
        where: intakeData.where || null,
        frequency: intakeData.frequency || null,
        question_on_mind: intakeData.question_on_mind || null,
        char_count: intakeData.query.length,
        input_type: isDescribe ? "description" : "lookup",
      });
      // Study only: saved once the answer is back so the row includes the AI response fields.
      const studyRow = { text: content, input_type: isDescribe ? "description" : "lookup", intake: intakePayload };
      const thisLookupId = crypto.randomUUID();
      setLookupId(thisLookupId);
      const summarize = (p: any) =>
        p
            ? {
                result_type: p.result_type ?? null,
                safety_category: isSafetyCategory(p.safety_category) ? p.safety_category : null,
                safety_source: p.safety_source ?? null,
                in_scope: p.in_scope ?? null,
                recognized: p.recognized ?? null,
                short_answer: typeof p.short_answer === "string" ? p.short_answer : null,
                help_block_shown: isSafetyCategory(p.safety_category),
              }
            : null;
      const saveStudyScan = (p: any) => {
        const response = summarize(p);
        saveStudyText("scan", { ...studyRow, response });
        saveLookup({
          id: thisLookupId,
          userId: session?.user?.id ?? null,
          inputType: studyRow.input_type,
          queryText: intakeData.query,
          intake: intakePayload,
          response: p ? { ...response, result: p } : { error: true },
        });
      };
      const startedAt = performance.now();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            content,
            inputType: isDescribe ? "description" : "text",
            intake: intakePayload,
          }),
        }
      );

      if (!response.ok) {
        saveStudyScan(null);
        const errData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error(
            errData.error ||
              "You've run a lot of checks in a short time. Please wait a few minutes and try again."
          );
        }
        throw new Error(errData.error || "Scan failed");
      }

      const payload = await response.json();
      saveStudyScan(payload);

      if (payload?.result_type === "escalation") {
        setEscalation(payload as EscalationResultData);
        localStorage.setItem("itook_first_scan_done", "true");
        return;
      }

      if (payload?.result_type === "identity_affirming") {
        setIdentity({
          ...payload,
          parent_guidance: payload.parent_guidance ?? [],
          resources: payload.resources?.length
            ? payload.resources
            : [
                { name: "The Trevor Project", number: "1-866-488-7386", tel: "18664887386" },
                { name: "PFLAG", number: "pflag.org", tel: "" },
              ],
        } as IdentityResultData);
        localStorage.setItem("itook_first_scan_done", "true");
        return;
      }

      if (payload?.result_type === "safety_only" && isSafetyCategory(payload.safety_category)) {
        setResult(payload as ScanResult);
        return;
      }
      if (payload?.result_type !== "report_v2") throw new Error("We couldn't finish this check. Please try again.");
      setResult(payload as ScanResult);
      setSaved(false);
      track("result_viewed", {
        in_scope: payload.in_scope ?? null,
        safety_category: isSafetyCategory(payload.safety_category) ? payload.safety_category : null,
        recognized: payload.recognized ?? null,
        lens_keys: (payload.lenses ?? []).map((l: { key: string }) => l.key),
        latency_ms: Math.round(performance.now() - startedAt),
        is_sample: false,
      });

      localStorage.setItem("itook_first_scan_done", "true");

      // Lookup is recorded above (no name attached unless signed in).
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleScanAnother = () => {
    sessionStorage.removeItem("scanIntake");
    navigate({ to: "/scan" });
  };

  const handleSaveReport = async () => {
    if (!user) {
      navigate({ to: "/signup" });
      return;
    }
    if (saved || !result || !intake) return;
    const r = result as any;
    const { error: saveErr } = await supabase.from("scans").insert({
      user_id: user.id,
      input_type: (intake as any).inputMode === "description" ? "description" : "text",
      input_content: intake.query ?? "",
      result_json: r,
      risk_level: r.in_scope ?? r.result_type ?? "saved",
      summary: r.short_answer ?? "",
      guidance: r.next_step?.action ?? "",
      escalated: !!r.safety_category,
      escalation_category: r.safety_category ?? null,
    } as any);
    if (saveErr) {
      setError("We couldn't save this. Please try again.");
      return;
    }
    setSaved(true);
    track("result_saved");
  };

  const handleDigestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDigestSubmitted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header isLoggedIn={!!user} />
        <main className="flex-1 flex items-center justify-center px-5">
          <div className="max-w-[26rem] w-full">
            <p className="text-[20px] text-foreground mb-3">Reading what you wrote.</p>
            <p className="text-[17px] text-muted-foreground mb-6">{progressLine}</p>
            <div className="h-[2px] w-full bg-border overflow-hidden rounded-full">
              <div className="h-full bg-foreground/50 transition-all duration-700" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header isLoggedIn={!!user} />
        <main className="flex-1 py-12 md:py-16">
          <div className="mx-auto max-w-[34rem] px-5">
            <ErrorFallbackView error={error} onRetry={() => navigate({ to: "/scan" })} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (identity) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header isLoggedIn={!!user} />
        <main className="flex-1 py-12 md:py-16">
          <div className="mx-auto max-w-[34rem] px-5">
            <IdentityResult
              result={identity}
              onScanAnother={() => {
                sessionStorage.removeItem("scanIntake");
                navigate({ to: "/scan" });
              }}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (escalation) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header isLoggedIn={!!user} />
        <main className="flex-1 py-12 md:py-16">
          <div className="mx-auto max-w-[34rem] px-5">
            <EscalationResult
              result={escalation}
              onScanAnother={() => {
                sessionStorage.removeItem("scanIntake");
                navigate({ to: "/scan" });
              }}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!result || !intake) return null;


  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={!!user} />

      <main className="flex-1 py-12 md:py-16">
        <div className="mx-auto max-w-[34rem] px-5">


          {(() => {
            const cat = (result as any).safety_category;
            return isSafetyCategory(cat) ? (
              <div className="mb-8"><SafetyHelpBlock category={cat} /></div>
            ) : null;
          })()}

          {(result as any).result_type === "safety_only" ? (
            <div className="space-y-6">
              {!(result as any).danger_only && (
                <p className="text-[17px] text-muted-foreground">
                  We couldn't finish the full answer right now. The help above is what matters most.
                </p>
              )}
              <Button onClick={handleScanAnother} size="lg">Ask about something else</Button>
            </div>
          ) : (result as any).safety_category === "immediate_danger" && !showAnyway ? (
            <button
              type="button"
              onClick={() => setShowAnyway(true)}
              className="text-[16px] text-hint underline underline-offset-4 hover:text-foreground"
            >
              Show guidance anyway
            </button>
          ) : (
          <>
          <ReportV2
            result={result as unknown as ReportV2Data}
            actions={
              <ResultActions
                onScanAnother={handleScanAnother}
                onSaveReport={handleSaveReport}
                onShowDigest={() => setShowDigest(true)}
                saved={saved}
                user={user}
                feedback={
                  variant === 2 ? <QuickQuestions key={ownKey} pageKey={ownKey} questions={OWN_QS} /> : studyMode ? <QuickQuestions pageKey="live" questions={LIVE_QS} /> : <FeedbackBox
                    lookupId={lookupId}
                    inScope={(result as any).in_scope}
                    safetyCategory={isSafetyCategory((result as any).safety_category) ? (result as any).safety_category : null}
                  />
                }
              />
            }
          />
          </>
          )}
          <p className="mt-8 text-[13px] text-hint leading-relaxed">
            This is not a diagnosis. Free, from a nonprofit.
          </p>


        </div>
      </main>



      {/* Digest signup modal */}
      {showDigest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-5">
          <div className="w-full max-w-md rounded-3xl bg-card p-6 border border-border/80">
            {digestSubmitted ? (
              <div className="text-center">
                <h2 className="text-xl font-medium text-foreground mb-4">You're signed up.</h2>
                <Button variant="outline" onClick={() => setShowDigest(false)}>Close</Button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-medium text-foreground mb-1">Get a monthly email</h2>
                <p className="text-[15px] text-hint mb-4">One email a month. Free.</p>
                <form onSubmit={handleDigestSubmit} className="space-y-3">
                  <Input
                    placeholder="Your name"
                    value={digestName}
                    onChange={(e) => setDigestName(e.target.value)}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={digestEmail}
                    onChange={(e) => setDigestEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full">Sign up</Button>
                </form>
                <button
                  onClick={() => setShowDigest(false)}
                  className="mt-3 w-full text-center text-[15px] text-hint hover:text-muted-foreground transition-colors"
                >
                  No thanks
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

/* ─── Briefing view — the editorial report ─── */

function ResultActions({
  onScanAnother, onSaveReport, onShowDigest, saved, user, feedback,
}: {
  onScanAnother: () => void; onSaveReport: () => void; onShowDigest: () => void;
  saved: boolean; user: any; feedback?: React.ReactNode;
}) {
  const isStudy = useIsStudy();
  return (
    <>
    {feedback}
    <div className="border-t border-border/80 pt-7 mt-7">
      <Button onClick={onScanAnother} size="lg">Ask about something else</Button>
      {!isStudy && (
        <div className="pt-6 flex flex-col gap-3 items-start">
          <details className="group">
            <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-3 py-2 text-left font-display text-[19px] text-foreground transition-colors hover:text-primary">
              <span>{saved ? "Saved" : user ? "Save this" : "Sign in to save this"}</span>
              <ChevronDown size={20} className="shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-2">
              <button onClick={onSaveReport} className="text-[15px] text-primary underline underline-offset-4">
                {saved ? "Saved" : user ? "Save this report" : "Sign in to save"}
              </button>
              {saved && (
                <Link to="/history" className="ml-3 text-[15px] text-primary underline underline-offset-4">
                  Add a note in Saved
                </Link>
              )}
              <p className="mt-1 text-[13px] text-hint">
                Saved items are visible only to you. You can delete them anytime.
              </p>
            </div>
          </details>
          {DIGEST_SIGNUP_ENABLED && <button onClick={onShowDigest} className="text-[15px] text-hint hover:text-foreground underline underline-offset-4">
            Get a monthly email
          </button>}
        </div>
      )}
    </div>
    </>
  );
}

function TrustFooter() {
  return (
    <div className="pt-8 pb-2">
      <div className="border-t border-border" />
      <div className="pt-6">
        <p className="text-[13px] text-hint leading-relaxed">
          This is not a diagnosis. Free, from a nonprofit.
        </p>
      </div>
    </div>
  );
}

function ErrorFallbackView({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <article className="space-y-0">
      <header className="pb-8">
        <p className="label-text mb-4">WHAT WE FOUND</p>
        <h1 className="font-display text-[28px] font-medium leading-[1.35] text-foreground mb-2">
          That didn't work
        </h1>
        <p className="text-[18px] text-muted-foreground leading-relaxed">
          Something went wrong on our end. Your question is still a good one.
        </p>
      </header>

      <div className="border-t border-border pt-7">
        <p className="text-[18px] text-muted-foreground leading-relaxed">{error}</p>
      </div>

      <div className="pt-8">
        <Button onClick={onRetry}>Try again</Button>
      </div>

      <TrustFooter />
    </article>
  );
}
