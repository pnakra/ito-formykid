import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle, HelpCircle, Search, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EscalationResult, type EscalationResultData } from "@/components/EscalationResult";
import { IdentityResult, type IdentityResultData } from "@/components/IdentityResult";
import { RefinementPanel, type RefinementValues } from "@/components/RefinementPanel";


export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Your report — is this ok?" },
      { name: "description", content: "Your parent briefing — what it is, why it matters, and how to talk about it." },
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
  gender: string;
  concerns: string[];
  observations: string[];
  query: string;
}

const SPECTRUM_POSITIONS: Record<string, number> = {
  "Mainstream": 10,
  "Edgy but benign": 35,
  "Concerning": 65,
  "High risk": 88,
  "Not enough signal": 0,
};


function ResultsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [escalation, setEscalation] = useState<EscalationResultData | null>(null);
  const [identity, setIdentity] = useState<IdentityResultData | null>(null);

  const [intake, setIntake] = useState<IntakeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scanCount, setScanCount] = useState<number | null>(null);
  const [showDigest, setShowDigest] = useState(false);
  const [digestEmail, setDigestEmail] = useState("");
  const [digestName, setDigestName] = useState("");
  const [digestSubmitted, setDigestSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [refining, setRefining] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("scanIntake");
    if (!stored) {
      navigate({ to: "/scan" });
      return;
    }

    const intakeData: IntakeData = JSON.parse(stored);
    setIntake(intakeData);
    runScan(intakeData);
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("scan_count")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setScanCount(data.scan_count);
        });
    }
  }, [user]);

  const runScan = async (intakeData: IntakeData & { inputMode?: "describe" | "lookup" }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const isDescribe = intakeData.inputMode === "describe";

      const contextParts: string[] = [];
      if (intakeData.age) contextParts.push(`Child's age: ${intakeData.age}`);
      if (intakeData.gender) contextParts.push(`Gender identity: ${intakeData.gender}`);
      if (intakeData.concerns?.length) contextParts.push(`Type of content concerned about: ${intakeData.concerns.join(", ")}`);
      if (intakeData.observations?.length) contextParts.push(`Behavioral signals noticed: ${intakeData.observations.join(", ")}`);
      if (!isDescribe) {
        contextParts.push(`Specific thing to analyze: ${intakeData.query.trim()}`);
      } else {
        contextParts.push(`Parent's description of what they noticed: ${intakeData.query.trim()}`);
      }

      const content = contextParts.join("\n");

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
            intake: intakeData,
            userId: user?.id ?? null,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Scan failed");
      }

      const payload = await response.json();

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

      const scanResult: ScanResult = payload;
      if (!scanResult.result_type) {
        scanResult.result_type = scanResult.confidence === "Low" ? "low_confidence" : "normal";
      }
      setResult(scanResult);


      localStorage.setItem("itook_first_scan_done", "true");

      // Scan persistence now happens server-side in the edge function so that
      // anonymous scans are also stored. For signed-in users we still bump scan_count.
      if (user) {
        const currentCount = scanCount ?? 0;
        const newCount = currentCount + 1;
        await supabase
          .from("profiles")
          .update({ scan_count: newCount })
          .eq("id", user.id);
        setScanCount(newCount);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async (next: RefinementValues) => {
    if (!intake) return;
    const stored = sessionStorage.getItem("scanIntake");
    const inputMode = stored ? (JSON.parse(stored).inputMode ?? "describe") : "describe";
    const updated = { ...intake, ...next, inputMode };
    setIntake(updated);
    sessionStorage.setItem("scanIntake", JSON.stringify(updated));
    setRefining(true);
    await runScan(updated);
    setRefining(false);
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
    setSaved(true);
  };

  const handleDigestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDigestSubmitted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header isLoggedIn={!!user} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-muted-foreground" />
            <p className="text-[15px] text-foreground mb-1">Preparing your briefing…</p>
            <p className="text-[13px] text-hint">This usually takes 10–15 seconds.</p>
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
        <main className="flex-1 py-10">
          <div className="mx-auto max-w-xl px-5">
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
        <main className="flex-1 py-10">
          <div className="mx-auto max-w-xl px-5">
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
        <main className="flex-1 py-10">
          <div className="mx-auto max-w-xl px-5">
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


  const resultType = result.result_type;

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={!!user} />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-xl px-5">

          {resultType === "not_enough_signal" ? (
            <NotEnoughSignalView result={result} intake={intake} onScanAnother={handleScanAnother} />
          ) : resultType === "ambiguous" ? (
            <AmbiguousView result={result} intake={intake} onScanAnother={handleScanAnother} />
          ) : resultType === "outside_scope" ? (
            <OutsideScopeView result={result} intake={intake} onScanAnother={handleScanAnother} />
          ) : (
            <BriefingView
              result={result}
              intake={intake}
              onScanAnother={handleScanAnother}
              onSaveReport={handleSaveReport}
              onShowDigest={() => setShowDigest(true)}
              saved={saved}
              user={user}
            />
          )}

          <RefinementPanel
            values={{
              age: intake.age ?? "",
              gender: intake.gender ?? "",
              concerns: intake.concerns ?? [],
              observations: intake.observations ?? [],
            }}
            onChange={handleRefine}
            busy={refining}
          />

        </div>
      </main>



      {/* Digest signup modal */}
      {showDigest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-5">
          <div className="w-full max-w-md rounded-[14px] bg-background p-6 border">
            {digestSubmitted ? (
              <div className="text-center">
                <h2 className="text-xl font-medium text-foreground mb-2">You're signed up!</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  We'll send the monthly digest to your inbox.
                </p>
                <Button variant="outline" onClick={() => setShowDigest(false)}>Close</Button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-medium text-foreground mb-1">Get the monthly digest</h2>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  What's trending in your child's age group, new communities to watch, and signals other parents are noticing. Free, monthly.
                </p>
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
                  <Button type="submit" className="w-full">Subscribe to the digest</Button>
                </form>
                <button
                  onClick={() => setShowDigest(false)}
                  className="mt-3 w-full text-center text-[13px] text-hint hover:text-muted-foreground transition-colors"
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

function BriefingView({
  result,
  intake,
  onScanAnother,
  onSaveReport,
  onShowDigest,
  saved,
  user,
}: {
  result: ScanResult;
  intake: IntakeData;
  onScanAnother: () => void;
  onSaveReport: () => void;
  onShowDigest: () => void;
  saved: boolean;
  user: any;
}) {
  const isLowConfidence = result.result_type === "low_confidence";

  return (
    <article className="space-y-0">

      {/* ── Header block ── */}
      <header className="pb-8">
        <p className="label-text mb-4">PARENT BRIEFING</p>
        <h1 className="text-[22px] font-medium leading-[1.35] text-foreground mb-3">
          {result.summary_verdict || result.what_it_is}
        </h1>
        <p className="text-[14px] text-hint leading-relaxed">
          You looked up <span className="text-foreground font-medium">{intake.query}</span>
          {intake.age && <> · age {intake.age}</>}
        </p>
      </header>

      {/* ── Low confidence notice ── */}
      {isLowConfidence && (
        <div className="border-l-[3px] border-border pl-4 pb-8">
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            {result.limitations_note || result.confidence_note || "There isn't enough public information for us to be sure. Treat this as a starting point."}
          </p>
        </div>
      )}

      <Divider />

      {/* 1 — What this is */}
      <Section label="What this is">
        <p className="text-[15px] text-foreground leading-relaxed">{result.what_it_is}</p>
      </Section>

      {/* 2 — Normalization line */}
      {(result.normalization_line || result.age_specific_note) && (
        <div className="pt-4">
          <p className="text-[15px] text-foreground leading-relaxed">
            {result.normalization_line || result.age_specific_note}
          </p>
        </div>
      )}

      <Divider />

      {/* 3 — What not to do */}
      <Section label="What not to do">
        <ul className="space-y-2">
          {result.what_not_to_do.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px] text-foreground leading-relaxed">
              <span className="mt-[9px] h-[5px] w-[5px] rounded-full bg-hint shrink-0" />
              <span className="flex-1">{s}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Divider />

      {/* 4 — Opening question */}
      <Section label="One way to start">
        <div className="rounded-[12px] bg-card border px-5 py-4">
          <p className="text-[15px] text-foreground italic leading-relaxed">
            "{result.opening_question}"
          </p>
        </div>
        <p className="text-[13px] text-hint leading-relaxed mt-3">Use your own words.</p>
      </Section>

      <Divider />

      {/* 5 — Why it appeals */}
      <Section label="Why it appeals">
        <p className="text-[14px] text-foreground leading-relaxed">{result.why_it_appeals}</p>
      </Section>

      <Divider />

      {/* 6 — Where this sits */}
      <Section label="Where this sits">
        <div className="mb-4">
          <div className="relative h-[3px] rounded-full bg-border">
            {result.spectrum_label !== "Not enough signal" && (
              <div
                className="absolute top-1/2 w-[9px] h-[9px] rounded-full bg-foreground"
                style={{ left: `${SPECTRUM_POSITIONS[result.spectrum_label] ?? 0}%`, transform: "translate(-50%, -50%)" }}
              />
            )}
          </div>
        </div>
        <p className="text-[15px] font-medium text-foreground">{result.spectrum_label}</p>
        <p className="text-[14px] text-foreground leading-relaxed mt-2">{result.spectrum_reasoning}</p>
        <p className="text-[13px] text-hint leading-relaxed mt-3">
          {result.confidence} confidence. {result.confidence_note}
        </p>
      </Section>

      <Divider />

      {/* 7 — Context, collapsed */}
      <Expander label="More context">
        <div className="space-y-5">
          {result.platform_context && (
            <p className="text-[14px] text-foreground leading-relaxed">{result.platform_context}</p>
          )}
          {result.pipeline_context && (
            <p className="text-[14px] text-foreground leading-relaxed">{result.pipeline_context}</p>
          )}
          {result.age_specific_note && intake.age && (
            <p className="text-[14px] text-foreground leading-relaxed">{result.age_specific_note}</p>
          )}
          {result.values_promoted?.length > 0 && (
            <ul className="space-y-2">
              {result.values_promoted.map((v, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] text-foreground leading-relaxed">
                  <span className="mt-[8px] h-[5px] w-[5px] rounded-full bg-hint shrink-0" />
                  <span className="flex-1">{v}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Expander>

      <Divider />

      {/* 8 — What to watch for, collapsed */}
      <Expander label="What to watch for">
        <ul className="space-y-2">
          {result.warning_signs.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-[14px] text-foreground leading-relaxed">
              <span className="mt-[8px] h-[5px] w-[5px] rounded-full bg-hint shrink-0" />
              <span className="flex-1">{s}</span>
            </li>
          ))}
          {result.return_signals?.map((s, i) => (
            <li key={`r-${i}`} className="flex items-start gap-3 text-[14px] leading-relaxed" style={{ color: "#3B6D11" }}>
              <span className="mt-[8px] h-[5px] w-[5px] rounded-full shrink-0" style={{ backgroundColor: "#3B6D11" }} />
              <span className="flex-1">{s}</span>
            </li>
          ))}
        </ul>
      </Expander>


      {/* ── Trust footer ── */}
      <div className="pt-8 pb-2">
        <div className="border-t border-border" />
        <div className="pt-6">
          <p className="text-[12px] text-hint leading-relaxed">
            This briefing is not a diagnosis. It does not monitor your child or their devices. It is based on limited information you chose to share, combined with publicly available knowledge about online culture and communities. Use your own judgment, your relationship with your child, and professional guidance when needed. Built by a nonprofit. No ads. No data sold.
          </p>
        </div>
      </div>

      {/* ── Next steps — secondary, not a hard sell ── */}
      <div className="pt-4 pb-2 space-y-3">
        <p className="label-text">NEXT</p>

        <button
          onClick={onScanAnother}
          className="w-full rounded-[10px] border bg-card p-4 text-left hover:bg-accent/50 transition-colors"
        >
          <p className="text-[14px] font-medium text-foreground">Look up something else</p>
        </button>

        <button
          onClick={onSaveReport}
          className="w-full rounded-[10px] border bg-card p-4 text-left hover:bg-accent/50 transition-colors"
        >
          <p className="text-[14px] font-medium text-foreground">
            {saved ? "✓ Report saved" : "Save this report"}
          </p>
          <p className="text-[12px] text-hint mt-0.5">
            {user ? "Access it anytime from your history" : "Sign in to save"}
          </p>
        </button>

        <button
          onClick={onShowDigest}
          className="w-full rounded-[10px] border bg-card p-4 text-left hover:bg-accent/50 transition-colors"
        >
          <p className="text-[14px] font-medium text-foreground">Get the monthly digest</p>
          <p className="text-[12px] text-hint mt-0.5">
            Free — what's trending in your child's age group, sent monthly.
          </p>
        </button>
      </div>

      <p className="mt-6 text-[13px] text-hint">
        Free. Built by a nonprofit. We never see your child's phone.
      </p>



    </article>
  );
}

/* ─── Layout primitives ─── */

function Divider() {
  return <div className="py-6"><div className="border-t border-border" /></div>;
}

function Expander({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="label-text">{label.toUpperCase()}</span>
        <span className="text-[13px] text-hint">{open ? "Hide" : "Show"}</span>
      </button>
      {open && <div className="mt-4">{children}</div>}
    </section>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="label-text mb-3">{label.toUpperCase()}</p>
      {children}
    </section>
  );
}

/* ─── Ambiguous view ─── */

function AmbiguousView({ result, intake, onScanAnother }: { result: ScanResult; intake: IntakeData; onScanAnother: () => void }) {
  const handleTrySpecific = (term: string) => {
    const stored = sessionStorage.getItem("scanIntake");
    if (stored) {
      const data = JSON.parse(stored);
      data.query = term;
      sessionStorage.setItem("scanIntake", JSON.stringify(data));
      window.location.reload();
    }
  };

  return (
    <article className="space-y-0">
      <header className="pb-8">
        <p className="label-text mb-4">PARENT BRIEFING</p>
        <div className="flex items-start gap-3">
          <HelpCircle className="h-5 w-5 shrink-0 mt-1 text-hint" />
          <div>
            <h1 className="text-[20px] font-medium leading-[1.35] text-foreground mb-2">
              {result.summary_verdict || "This could mean a few different things"}
            </h1>
            <p className="text-[14px] text-hint">
              You looked up <span className="text-foreground font-medium">{intake.query}</span>
            </p>
          </div>
        </div>
      </header>

      {result.what_it_is && (
        <>
          <Divider />
          <Section label="What we know">
            <p className="text-[14px] text-foreground leading-relaxed">{result.what_it_is}</p>
          </Section>
        </>
      )}

      {result.disambiguation_options && result.disambiguation_options.length > 0 && (
        <>
          <Divider />
          <Section label="Did you mean one of these?">
            <div className="space-y-2">
              {result.disambiguation_options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleTrySpecific(option)}
                  className="w-full rounded-[10px] border bg-card p-3.5 text-left hover:bg-accent/50 transition-colors"
                >
                  <p className="text-[14px] text-foreground">{option}</p>
                </button>
              ))}
            </div>
          </Section>
        </>
      )}

      <Divider />
      <div className="pb-2">
        <p className="text-[13px] text-hint leading-relaxed">
          <span className="text-foreground font-medium">Tip:</span> Try being more specific — include the platform name, the creator's full handle, or describe the behavior you noticed.
        </p>
      </div>

      <TrustFooter />
    </article>
  );
}

/* ─── Outside scope view ─── */

function NotEnoughSignalView({ result, intake, onScanAnother }: { result: ScanResult; intake: IntakeData; onScanAnother: () => void }) {
  return (
    <article className="space-y-0">
      <header className="pb-8">
        <p className="label-text mb-4">PARENT BRIEFING</p>
        <h1 className="text-[20px] font-medium leading-[1.35] text-foreground mb-2">
          Not enough signal yet
        </h1>
        <p className="text-[14px] text-hint">
          You looked up <span className="text-foreground font-medium">{intake.query}</span>
        </p>
      </header>

      <Divider />

      <Section label="What we can say">
        <p className="text-[15px] text-foreground leading-relaxed">
          {result.what_we_can_say || result.summary_verdict || result.what_it_is}
        </p>
      </Section>

      <Divider />

      <Section label="What would help">
        <p className="text-[15px] text-foreground leading-relaxed">
          {result.what_would_help || "Write down the next thing you notice — the exact words, and when it happened."}
        </p>
      </Section>

      {result.opening_question && (
        <>
          <Divider />
          <Section label="One way to open the conversation">
            <div className="rounded-[12px] bg-card border px-5 py-4">
              <p className="text-[15px] text-foreground italic leading-relaxed">
                "{result.opening_question}"
              </p>
            </div>
          </Section>
        </>
      )}

      <div className="pt-8">
        <button
          onClick={onScanAnother}
          className="w-full rounded-[10px] border bg-card p-4 text-left hover:bg-accent/50 transition-colors"
        >
          <p className="text-[14px] font-medium text-foreground">Look up something else</p>
        </button>
      </div>
    </article>
  );
}

function OutsideScopeView({ result, intake, onScanAnother }: { result: ScanResult; intake: IntakeData; onScanAnother: () => void }) {
  return (
    <article className="space-y-0">
      <header className="pb-8">
        <p className="label-text mb-4">PARENT BRIEFING</p>
        <div className="flex items-start gap-3">
          <Search className="h-5 w-5 shrink-0 mt-1 text-hint" />
          <div>
            <h1 className="text-[20px] font-medium leading-[1.35] text-foreground mb-2">
              {result.summary_verdict || "This doesn't fall within the areas we cover right now"}
            </h1>
            <p className="text-[14px] text-hint">
              You looked up <span className="text-foreground font-medium">{intake.query}</span>
            </p>
          </div>
        </div>
      </header>

      {result.what_it_is && (
        <>
          <Divider />
          <Section label="What we can tell you">
            <p className="text-[14px] text-foreground leading-relaxed">{result.what_it_is}</p>
          </Section>
        </>
      )}

      {result.scope_note && (
        <>
          <Divider />
          <Section label="What we currently cover">
            <p className="text-[14px] text-muted-foreground leading-relaxed">{result.scope_note}</p>
          </Section>
        </>
      )}

      <Divider />
      <Section label="Things you can try">
        <ul className="space-y-2">
          <li className="flex items-start gap-3 text-[14px] text-foreground leading-relaxed">
            <span className="mt-[8px] h-[5px] w-[5px] rounded-full bg-hint shrink-0" />
            <span>Use a more specific term, like the name of a creator or community</span>
          </li>
          <li className="flex items-start gap-3 text-[14px] text-foreground leading-relaxed">
            <span className="mt-[8px] h-[5px] w-[5px] rounded-full bg-hint shrink-0" />
            <span>Describe a behavior you've noticed instead of a general topic</span>
          </li>
          <li className="flex items-start gap-3 text-[14px] text-foreground leading-relaxed">
            <span className="mt-[8px] h-[5px] w-[5px] rounded-full bg-hint shrink-0" />
            <span>Check back as we expand our coverage over time</span>
          </li>
        </ul>
      </Section>

      <TrustFooter />
    </article>
  );
}

/* ─── Shared components ─── */

function TrustFooter() {
  return (
    <div className="pt-8 pb-2">
      <div className="border-t border-border" />
      <div className="pt-6">
        <p className="text-[12px] text-hint leading-relaxed">
          This briefing is not a diagnosis. It does not monitor your child or their devices. It is based on limited information you chose to share. Use your own judgment and your relationship with your child. Built by a nonprofit. No ads. No data sold.
        </p>
      </div>
    </div>
  );
}

function ErrorFallbackView({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <article className="space-y-0">
      <header className="pb-8">
        <p className="label-text mb-4">PARENT BRIEFING</p>
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-1" style={{ color: "#C4854C" }} />
          <div>
            <h1 className="text-[20px] font-medium leading-[1.35] text-foreground mb-2">
              We weren't able to complete this lookup
            </h1>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              This isn't your fault — something went wrong on our end. Your question is still a good one.
            </p>
          </div>
        </div>
      </header>

      <Divider />

      <Section label="What happened">
        <p className="text-[14px] text-muted-foreground leading-relaxed mb-1">{error}</p>
        <p className="text-[14px] text-muted-foreground leading-relaxed">
          You can try again — sometimes it just takes a second attempt. If this keeps happening, the term may be too broad or unusual for us to analyze right now.
        </p>
      </Section>

      <div className="pt-8">
        <Button onClick={onRetry}>Try again</Button>
      </div>

      <TrustFooter />
    </article>
  );
}
