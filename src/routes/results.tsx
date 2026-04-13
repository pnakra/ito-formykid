import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
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

interface ScanResult {
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

  // Collapsible card state: FOR PARENTS defaults expanded, rest collapsed
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
        });

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

  // Helper to get first sentence for preview
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
          <div className="mx-auto max-w-xl px-5 text-center">
            <h1 className="text-xl font-medium text-foreground mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-5">{error}</p>
            <Button onClick={() => navigate({ to: "/scan" })}>Try again</Button>
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

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-xl px-5 space-y-3">

          {/* Summary card — always visible, never collapsible */}
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

          {/* Expand / Collapse all toggle */}
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

          {/* Card 5 — For parents (defaults EXPANDED) */}
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
          <CollapsibleCard
            label="NEXT STEPS"
            previewText="Look up something else, save this report, or get the monthly digest"
            isOpen={openCards.nextSteps}
            onToggle={() => toggleCard("nextSteps")}
          >
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleScanAnother}
                className="rounded-[10px] border bg-background p-4 text-left hover:bg-accent transition-colors"
              >
                <p className="text-[15px] font-medium text-foreground">Scan something else</p>
                <p className="text-[13px] text-muted-foreground">Analyze another creator, game, or term</p>
              </button>

              <button
                onClick={handleSaveReport}
                className="rounded-[10px] border bg-background p-4 text-left hover:bg-accent transition-colors"
              >
                <p className="text-[15px] font-medium text-foreground">
                  {saved ? "✓ Report saved" : "Save this report"}
                </p>
                <p className="text-[13px] text-muted-foreground">
                  {!user ? "Sign in to save" : !isSubscribed ? "Subscribe to save reports" : "Access it anytime from your account"}
                </p>
              </button>

              <button
                onClick={() => setShowDigest(true)}
                className="rounded-[10px] border bg-background p-4 text-left hover:bg-accent transition-colors"
              >
                <p className="text-[15px] font-medium text-foreground">Get the monthly digest</p>
                <p className="text-[13px] text-muted-foreground">
                  Free for everyone — what's trending in your child's age group, sent monthly.
                </p>
              </button>
            </div>
          </CollapsibleCard>

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
                  Sign up to save reports, look up more content, and get the monthly digest. Your first 3 lookups are free.
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
                <h2 className="text-xl font-medium text-foreground mb-2">You've used your free lookups.</h2>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  Get unlimited scans, saved reports, and the monthly digest for $9/month.
                </p>
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
