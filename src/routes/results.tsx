import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle, HelpCircle, Search, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CollapsibleCard } from "@/components/CollapsibleCard";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Your report — is this ok?" },
      { name: "description", content: "Your personalized content analysis report." },
    ],
  }),
  component: ResultsPage,
});

type ResultType = "normal" | "low_confidence" | "ambiguous" | "outside_scope";

interface ScanResult {
  result_type: ResultType;
  summary_verdict: string;
  what_it_is: string;
  platform_context: string;
  spectrum_label: "Mainstream" | "Edgy but benign" | "Concerning" | "High risk";
  spectrum_reasoning: string;
  confidence: "Low" | "Medium" | "High";
  confidence_note: string;
  why_it_appeals: string;
  pipeline_context: string | null;
  values_promoted: string[];
  age_specific_note: string | null;
  what_not_to_do: string[];
  opening_question: string;
  warning_signs: string[];
  return_signals: string[];
  disambiguation_options: string[] | null;
  scope_note: string | null;
  limitations_note: string | null;
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
};

const SPECTRUM_COLORS: Record<string, string> = {
  "Mainstream": "bg-risk-low text-risk-low-foreground",
  "Edgy but benign": "bg-risk-neutral text-risk-neutral-foreground",
  "Concerning": "bg-risk-concerning text-risk-concerning-foreground",
  "High risk": "bg-risk-high text-risk-high-foreground",
};

const CONFIDENCE_COLORS: Record<string, string> = {
  "Low": "bg-risk-concerning text-risk-concerning-foreground",
  "Medium": "bg-risk-neutral text-risk-neutral-foreground",
  "High": "bg-risk-low text-risk-low-foreground",
};

function ResultsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [intake, setIntake] = useState<IntakeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scanCount, setScanCount] = useState<number | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showDigest, setShowDigest] = useState(false);
  const [digestEmail, setDigestEmail] = useState("");
  const [digestName, setDigestName] = useState("");
  const [digestSubmitted, setDigestSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  const [openCards, setOpenCards] = useState<Record<string, boolean>>({
    whatThisIs: false,
    whyItAppeals: false,
    valuesPromoted: false,
    watchFor: false,
    forParents: true,
    nextSteps: false,
  });

  const toggleCard = (key: string) => {
    setOpenCards(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allExpanded = Object.values(openCards).every(v => v);
  const toggleAll = () => {
    const newState = !allExpanded;
    setOpenCards({
      whatThisIs: newState,
      whyItAppeals: newState,
      valuesPromoted: newState,
      watchFor: newState,
      forParents: newState,
      nextSteps: newState,
    });
  };

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
        .select("scan_count, is_subscribed")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setScanCount(data.scan_count);
            setIsSubscribed(data.is_subscribed);
          }
        });
    }
  }, [user]);

  const runScan = async (intakeData: IntakeData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const contextParts: string[] = [];
      if (intakeData.age) contextParts.push(`Child's age: ${intakeData.age}`);
      if (intakeData.gender) contextParts.push(`Gender identity: ${intakeData.gender}`);
      if (intakeData.concerns.length) contextParts.push(`Type of content concerned about: ${intakeData.concerns.join(", ")}`);
      if (intakeData.observations.length) contextParts.push(`Behavioral signals noticed: ${intakeData.observations.join(", ")}`);
      contextParts.push(`Specific thing to analyze: ${intakeData.query.trim()}`);

      const content = contextParts.join("\n");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ content, inputType: "text" }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Scan failed");
      }

      const scanResult: ScanResult = await response.json();
      // Ensure result_type defaults to normal if missing
      if (!scanResult.result_type) {
        scanResult.result_type = scanResult.confidence === "Low" ? "low_confidence" : "normal";
      }
      setResult(scanResult);

      localStorage.setItem("itook_first_scan_done", "true");

      if (user) {
        await supabase.from("scans").insert({
          user_id: user.id,
          input_type: "text",
          input_content: content,
          risk_level: scanResult.spectrum_label,
          summary: scanResult.what_it_is,
          guidance: scanResult.why_it_appeals,
          domain_category: scanResult.result_type === "outside_scope" ? "outside_scope" : null,
          confidence: scanResult.confidence,
          age_context: intakeData.age || null,
          concern_areas: intakeData.concerns.length > 0 ? intakeData.concerns : null,
          spectrum_label: scanResult.spectrum_label,
          summary_verdict: scanResult.summary_verdict,
          status: "watching",
        } as any);

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

  const handleScanAnother = () => {
    if (!user) {
      setShowPaywall(true);
      return;
    }
    if (!isSubscribed && (scanCount ?? 0) >= 3) {
      setShowPaywall(true);
    } else {
      sessionStorage.removeItem("scanIntake");
      navigate({ to: "/scan" });
    }
  };

  const handleSaveReport = async () => {
    if (!user) {
      setShowPaywall(true);
      return;
    }
    if (!isSubscribed) {
      navigate({ to: "/checkout" });
      return;
    }
    setSaved(true);
  };

  const handleDigestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDigestSubmitted(true);
  };

  const firstSentence = (text: string) => {
    const match = text.match(/^[^.!?]+[.!?]/);
    return match ? match[0] : text;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header isLoggedIn={!!user} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-muted-foreground" />
            <p className="text-[15px] text-foreground mb-1">Analyzing…</p>
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

  if (!result || !intake) return null;

  const resultType = result.result_type;

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={!!user} />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-xl px-5 space-y-3">

          {/* Summary card — always visible */}
          {resultType === "ambiguous" ? (
            <AmbiguousSummaryCard result={result} intake={intake} onScanAnother={handleScanAnother} />
          ) : resultType === "outside_scope" ? (
            <OutsideScopeSummaryCard result={result} intake={intake} onScanAnother={handleScanAnother} />
          ) : (
            <StandardSummaryCard result={result} intake={intake} />
          )}

          {/* Low confidence banner — shown for low_confidence results */}
          {resultType === "low_confidence" && (
            <LowConfidenceBanner result={result} />
          )}

          {/* For ambiguous and outside_scope, show simplified next steps only */}
          {(resultType === "ambiguous" || resultType === "outside_scope") ? (
            <div className="space-y-3">
              {resultType === "outside_scope" && result.what_it_is && (
                <div className="rounded-[14px] bg-card p-5">
                  <p className="label-text mb-2">WHAT WE CAN TELL YOU</p>
                  <p className="text-[15px] text-foreground leading-relaxed">{result.what_it_is}</p>
                </div>
              )}
              <NextStepsCard
                onScanAnother={handleScanAnother}
                onSaveReport={handleSaveReport}
                onShowDigest={() => setShowDigest(true)}
                saved={saved}
                user={user}
                isSubscribed={isSubscribed}
                isOpen={true}
                onToggle={() => {}}
                alwaysOpen
              />
            </div>
          ) : (
            <>
              {/* Normal / low_confidence — full report cards */}
              <div className="flex justify-end">
                <button
                  onClick={toggleAll}
                  className="text-[12px] hover:underline transition-colors"
                  style={{ color: "#9AA898" }}
                >
                  {allExpanded ? "Collapse all" : "Expand all"}
                </button>
              </div>

              {/* Card 1 — What this is */}
              <CollapsibleCard
                label="WHAT THIS IS"
                previewText={firstSentence(result.what_it_is)}
                isOpen={openCards.whatThisIs}
                onToggle={() => toggleCard("whatThisIs")}
              >
                <h2 className="text-xl font-medium text-foreground mb-3">{intake.query}</h2>
                <p className="text-[15px] text-foreground leading-relaxed mb-2">{result.what_it_is}</p>
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-5">{result.platform_context}</p>

                {/* Spectrum track */}
                <div className="mb-4">
                  <div className="relative h-2 rounded-full bg-gradient-to-r from-risk-low via-risk-concerning to-risk-high mb-2">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-foreground border-2 border-background"
                      style={{ left: `${SPECTRUM_POSITIONS[result.spectrum_label]}%`, transform: "translate(-50%, -50%)" }}
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={SPECTRUM_COLORS[result.spectrum_label]}>
                      {result.spectrum_label}
                    </Badge>
                  </div>
                  <p className="label-text mt-2 mb-1">WHY THIS CLASSIFICATION</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{result.spectrum_reasoning}</p>
                </div>

                {/* Confidence */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={CONFIDENCE_COLORS[result.confidence]}>
                      {result.confidence} confidence
                    </Badge>
                  </div>
                  <p className="label-text mt-2 mb-1">WHY THIS CONFIDENCE LEVEL</p>
                  <p className="text-[13px] text-hint leading-relaxed">{result.confidence_note}</p>
                  {resultType === "low_confidence" && result.limitations_note && (
                    <div className="mt-3 rounded-[10px] border border-risk-concerning/30 bg-risk-concerning/10 p-3">
                      <p className="text-[13px] text-foreground leading-relaxed">{result.limitations_note}</p>
                    </div>
                  )}
                </div>
              </CollapsibleCard>

              {/* Card 2 — Why it appeals */}
              <CollapsibleCard
                label="WHY YOUNG PEOPLE WATCH THIS"
                previewText={firstSentence(result.why_it_appeals)}
                isOpen={openCards.whyItAppeals}
                onToggle={() => toggleCard("whyItAppeals")}
              >
                <p className="text-[15px] text-foreground leading-relaxed">{result.why_it_appeals}</p>
                {result.pipeline_context && (
                  <div className="mt-4 border-l-[3px] border-risk-concerning-foreground rounded-r-[10px] bg-risk-concerning/30 p-4">
                    <p className="label-text mb-1">PART OF A LARGER PATTERN</p>
                    <p className="text-[13px] text-foreground leading-relaxed">{result.pipeline_context}</p>
                  </div>
                )}
              </CollapsibleCard>

              {/* Card 3 — Values it may promote */}
              <CollapsibleCard
                label="VALUES IT MAY PROMOTE"
                previewText={firstSentence(result.values_promoted[0] || "")}
                isOpen={openCards.valuesPromoted}
                onToggle={() => toggleCard("valuesPromoted")}
              >
                <ul className="space-y-2">
                  {result.values_promoted.map((v, i) => (
                    <li key={i} className="flex items-start gap-3 text-[15px] text-foreground leading-relaxed">
                      <span className="mt-[9px] h-[5px] w-[5px] rounded-full bg-muted-foreground shrink-0" />
                      <span className="flex-1">{v}</span>
                    </li>
                  ))}
                </ul>
                {result.age_specific_note && intake.age && (
                  <div className="mt-4 rounded-[10px] bg-background border p-4">
                    <p className="label-text mb-1">NOTE FOR PARENTS OF {intake.age}-YEAR-OLDS</p>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{result.age_specific_note}</p>
                  </div>
                )}
              </CollapsibleCard>

              {/* Card 4 — Warning signs */}
              <CollapsibleCard
                label="WHAT TO WATCH FOR"
                previewText={firstSentence(result.warning_signs[0] || "")}
                isOpen={openCards.watchFor}
                onToggle={() => toggleCard("watchFor")}
              >
                <p className="text-[13px] text-muted-foreground mb-3">Signs of deeper engagement — observable without monitoring their device</p>
                <ul className="space-y-2 mb-4">
                  {result.warning_signs.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-[15px] text-foreground leading-relaxed">
                      <span className="mt-[9px] h-[5px] w-[5px] rounded-full bg-muted-foreground shrink-0" />
                      <span className="flex-1">{s}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t pt-4">
                  <p className="text-[13px] text-muted-foreground mb-3">Signs things may be improving</p>
                  <ul className="space-y-2">
                    {result.return_signals.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed" style={{ color: "#3B6D11" }}>
                        <span className="mt-[9px] h-[5px] w-[5px] rounded-full shrink-0" style={{ backgroundColor: "#3B6D11" }} />
                        <span className="flex-1">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CollapsibleCard>

              {/* Card 5 — For parents */}
              <CollapsibleCard
                label="FOR PARENTS"
                previewText={firstSentence(result.what_not_to_do[0] || "")}
                isOpen={openCards.forParents}
                onToggle={() => toggleCard("forParents")}
              >
                <p className="text-[13px] text-muted-foreground mb-3">What tends to backfire</p>
                <ul className="space-y-2 mb-4">
                  {result.what_not_to_do.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-[15px] text-foreground leading-relaxed">
                      <span className="mt-[9px] h-[5px] w-[5px] rounded-full bg-muted-foreground shrink-0" />
                      <span className="flex-1">{s}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t pt-4">
                  <p className="text-[13px] text-muted-foreground mb-3">One way to open the conversation</p>
                  <div className="border-l-[3px] pl-4" style={{ borderColor: "#3B5438" }}>
                    <p className="text-[15px] text-foreground italic leading-relaxed">{result.opening_question}</p>
                  </div>
                  <p className="text-[12px] text-hint mt-3 leading-relaxed">
                    This is a suggestion, not a script. The most effective conversations start with your own words and genuine curiosity.
                  </p>
                </div>
              </CollapsibleCard>

              {/* Card 6 — Next steps */}
              <NextStepsCard
                onScanAnother={handleScanAnother}
                onSaveReport={handleSaveReport}
                onShowDigest={() => setShowDigest(true)}
                saved={saved}
                user={user}
                isSubscribed={isSubscribed}
                isOpen={openCards.nextSteps}
                onToggle={() => toggleCard("nextSteps")}
              />
            </>
          )}

        </div>
      </main>

      {/* Paywall modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-5">
          <div className="w-full max-w-md rounded-[14px] bg-background p-6 border">
            {!user ? (
              <>
                <h2 className="text-xl font-medium text-foreground mb-2">Create a free account to continue</h2>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  Sign up to save reports, track situations over time, and get the monthly digest. Free lookups included.
                </p>
                <div className="space-y-2">
                  <Button className="w-full" onClick={() => navigate({ to: "/signup" })}>
                    Sign up free
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={() => navigate({ to: "/login" })}
                  >
                    Already have an account? Sign in
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={() => { setShowPaywall(false); setShowDigest(true); }}
                  >
                    Not right now
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-medium text-foreground mb-2">Continue with ongoing support</h2>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  For $9/month, keep this tool as a companion — not just for moments of worry, but for staying ahead over time.
                </p>
                <ul className="text-sm text-muted-foreground mb-5 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />Save reports and add notes over time</li>
                  <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />Track situations and see patterns</li>
                  <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />Monthly briefings for your child's age group</li>
                  <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />Protective factors guidance</li>
                </ul>
                <div className="space-y-2">
                  <Button className="w-full" onClick={() => navigate({ to: "/checkout" })}>
                    Subscribe
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={() => { setShowPaywall(false); setShowDigest(true); }}
                  >
                    Not right now
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
                  <Button type="submit" className="w-full">Sign me up</Button>
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

/* ─── Sub-components for result states ─── */

function StandardSummaryCard({ result, intake }: { result: ScanResult; intake: IntakeData }) {
  return (
    <div className="rounded-[14px] p-6" style={{ backgroundColor: "#F5F2EC" }}>
      <p className="text-[18px] font-medium leading-relaxed text-center" style={{ color: "#2C3B2A" }}>
        {result.summary_verdict || result.what_it_is}
      </p>
      <div className="flex items-center justify-center gap-3 mt-4">
        <Badge className={SPECTRUM_COLORS[result.spectrum_label]}>
          {result.spectrum_label}
        </Badge>
      </div>
      <p className="text-[13px] text-center mt-2" style={{ color: "#9AA898" }}>
        {intake.query}
      </p>
    </div>
  );
}

function LowConfidenceBanner({ result }: { result: ScanResult }) {
  return (
    <div className="rounded-[14px] border border-risk-concerning/30 bg-risk-concerning/10 p-4 flex items-start gap-3">
      <Info className="h-5 w-5 shrink-0 mt-0.5 text-risk-concerning-foreground" />
      <div>
        <p className="text-[14px] font-medium text-foreground mb-1">
          We're not highly confident in this result
        </p>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          {result.limitations_note || result.confidence_note || "This term may be used in multiple contexts, or there isn't enough public information for us to be certain. The information below is our best understanding, but please treat it as a starting point rather than a definitive answer."}
        </p>
      </div>
    </div>
  );
}

function AmbiguousSummaryCard({ result, intake, onScanAnother }: { result: ScanResult; intake: IntakeData; onScanAnother: () => void }) {
  const navigate = useNavigate();

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
    <div className="rounded-[14px] p-6 space-y-5" style={{ backgroundColor: "#F5F2EC" }}>
      <div className="flex items-start gap-3">
        <HelpCircle className="h-6 w-6 shrink-0 mt-0.5" style={{ color: "#9AA898" }} />
        <div>
          <p className="text-[18px] font-medium leading-relaxed" style={{ color: "#2C3B2A" }}>
            {result.summary_verdict || "This could refer to a few different things — we need a bit more context to give you a useful answer."}
          </p>
          <p className="text-[13px] mt-2" style={{ color: "#9AA898" }}>
            You searched: {intake.query}
          </p>
        </div>
      </div>

      {result.what_it_is && (
        <p className="text-[14px] text-foreground leading-relaxed">
          {result.what_it_is}
        </p>
      )}

      {result.disambiguation_options && result.disambiguation_options.length > 0 && (
        <div>
          <p className="label-text mb-2">DID YOU MEAN ONE OF THESE?</p>
          <div className="space-y-2">
            {result.disambiguation_options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleTrySpecific(option)}
                className="w-full rounded-[10px] border bg-background p-3 text-left hover:bg-accent transition-colors"
              >
                <p className="text-[14px] text-foreground">{option}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-[10px] bg-background/60 p-4">
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Tip:</strong> Try being more specific — for example, include the platform name, the creator's full name, or describe what your child was doing when you noticed it.
        </p>
      </div>
    </div>
  );
}

function OutsideScopeSummaryCard({ result, intake, onScanAnother }: { result: ScanResult; intake: IntakeData; onScanAnother: () => void }) {
  return (
    <div className="rounded-[14px] p-6 space-y-5" style={{ backgroundColor: "#F5F2EC" }}>
      <div className="flex items-start gap-3">
        <Search className="h-6 w-6 shrink-0 mt-0.5" style={{ color: "#9AA898" }} />
        <div>
          <p className="text-[18px] font-medium leading-relaxed" style={{ color: "#2C3B2A" }}>
            {result.summary_verdict || "This doesn't fall within the areas we're currently equipped to assess."}
          </p>
          <p className="text-[13px] mt-2" style={{ color: "#9AA898" }}>
            You searched: {intake.query}
          </p>
        </div>
      </div>

      {result.scope_note && (
        <div className="rounded-[10px] bg-background/60 p-4">
          <p className="label-text mb-2">WHAT WE CURRENTLY COVER</p>
          <p className="text-[13px] text-muted-foreground leading-relaxed">{result.scope_note}</p>
        </div>
      )}

      <div className="rounded-[10px] bg-background/60 p-4 space-y-2">
        <p className="text-[14px] font-medium text-foreground">Things you can try</p>
        <ul className="space-y-1.5">
          <li className="flex items-start gap-2 text-[13px] text-muted-foreground leading-relaxed">
            <span className="mt-[7px] h-[5px] w-[5px] rounded-full bg-muted-foreground shrink-0" />
            <span>Use a more specific term, like the name of a creator or community</span>
          </li>
          <li className="flex items-start gap-2 text-[13px] text-muted-foreground leading-relaxed">
            <span className="mt-[7px] h-[5px] w-[5px] rounded-full bg-muted-foreground shrink-0" />
            <span>Describe a behavior you've noticed instead of a general topic</span>
          </li>
          <li className="flex items-start gap-2 text-[13px] text-muted-foreground leading-relaxed">
            <span className="mt-[7px] h-[5px] w-[5px] rounded-full bg-muted-foreground shrink-0" />
            <span>Check back as we expand our coverage over time</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function ErrorFallbackView({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="rounded-[14px] p-6 space-y-5" style={{ backgroundColor: "#F5F2EC" }}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" style={{ color: "#C4854C" }} />
        <div>
          <p className="text-[18px] font-medium leading-relaxed" style={{ color: "#2C3B2A" }}>
            We weren't able to complete this lookup
          </p>
          <p className="text-[14px] mt-2 leading-relaxed" style={{ color: "#5C6B5A" }}>
            This isn't your fault — something went wrong on our end. Your question is still a good one.
          </p>
        </div>
      </div>

      <div className="rounded-[10px] bg-background/60 p-4">
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-1">
          <strong className="text-foreground">What happened:</strong> {error}
        </p>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          You can try again — sometimes it just takes a second attempt. If this keeps happening, the term may be too broad or unusual for us to analyze right now.
        </p>
      </div>

      <div className="flex gap-3">
        <Button onClick={onRetry} className="flex-1">Try again</Button>
      </div>
    </div>
  );
}

function NextStepsCard({
  onScanAnother,
  onSaveReport,
  onShowDigest,
  saved,
  user,
  isSubscribed,
  isOpen,
  onToggle,
  alwaysOpen,
}: {
  onScanAnother: () => void;
  onSaveReport: () => void;
  onShowDigest: () => void;
  saved: boolean;
  user: any;
  isSubscribed: boolean;
  isOpen: boolean;
  onToggle: () => void;
  alwaysOpen?: boolean;
}) {
  const content = (
    <div className="grid grid-cols-1 gap-3">
      <button
        onClick={onScanAnother}
        className="rounded-[10px] border bg-background p-4 text-left hover:bg-accent transition-colors"
      >
        <p className="text-[15px] font-medium text-foreground">Look up something else</p>
        <p className="text-[13px] text-muted-foreground">Analyze another creator, game, or term</p>
      </button>

      <button
        onClick={onSaveReport}
        className="rounded-[10px] border bg-background p-4 text-left hover:bg-accent transition-colors"
      >
        <p className="text-[15px] font-medium text-foreground">
          {saved ? "✓ Report saved" : "Save this report"}
        </p>
        <p className="text-[13px] text-muted-foreground">
          {!user ? "Sign in to save" : !isSubscribed ? "Available with ongoing support" : "Access it anytime from your account"}
        </p>
      </button>

      <button
        onClick={onShowDigest}
        className="rounded-[10px] border bg-background p-4 text-left hover:bg-accent transition-colors"
      >
        <p className="text-[15px] font-medium text-foreground">Get the monthly digest</p>
        <p className="text-[13px] text-muted-foreground">
          Free for everyone — what's trending in your child's age group, sent monthly.
        </p>
      </button>
    </div>
  );

  if (alwaysOpen) {
    return (
      <div className="rounded-[14px] bg-card p-5">
        <p className="label-text mb-3">NEXT STEPS</p>
        {content}
      </div>
    );
  }

  return (
    <CollapsibleCard
      label="NEXT STEPS"
      previewText="Look up something else, save this report, or get the monthly digest"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {content}
    </CollapsibleCard>
  );
}
