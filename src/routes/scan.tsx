import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scan content — is this ok?" },
      { name: "description", content: "Paste a URL or describe content to get a calm, clear assessment." },
    ],
  }),
  component: ScanPage,
});

interface IntakeData {
  age: string;
  gender: string;
  concerns: string[];
  observations: string[];
  query: string;
}


const CONCERN_OPTIONS = [
  "A specific creator, YouTuber, or podcast",
  "A game or gaming community",
  "Language or phrases I've been hearing",
  "Attitude or behavior changes",
  "Something I saw online that I don't understand",
  "I'm not sure — I just have a feeling something is off",
];

const OBSERVATION_OPTIONS = [
  "Language or attitudes toward women that concern me",
  "Language or attitudes toward LGBTQ+ people that concern me",
  "Withdrawal from family or friends",
  "A new online community or friend group I don't know much about",
  "Changes in how they talk about their own body or appearance",
  "Content about masculinity or \"being a real man\"",
  "Content about dieting, fitness, or body image that feels excessive",
  "Something they said that I couldn't place",
  "I haven't noticed anything specific yet",
];

const AUTOFILL_CHIPS = ["Andrew Tate", "looksmaxxing", "Fresh & Fit", "redpill"];

function ScanPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<IntakeData>({
    age: "",
    gender: "",
    concerns: [],
    observations: [],
    query: "",
  });
  const [error, setError] = useState("");
  const [scanCount, setScanCount] = useState<number | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, authLoading, navigate]);

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

  const canScan = isSubscribed || (scanCount !== null && scanCount < 3);

  const canAdvance = () => {
    if (step === 1) return true; // all optional
    if (step === 2) return data.concerns.length > 0;
    if (step === 3) return true; // optional
    if (step === 4) return data.query.trim().length > 0;
    return false;
  };

  const toggleItem = (list: string[], item: string): string[] =>
    list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

  const handleSubmit = () => {
    if (!data.query.trim()) return;

    if (!canScan) {
      setError("You've used your 3 free scans. Subscribe to continue.");
      return;
    }

    // Store intake data and navigate to results
    sessionStorage.setItem("scanIntake", JSON.stringify(data));
    navigate({ to: "/results" });
  };

  if (authLoading) return null;

  if (result) {
    return <ResultView result={result} onNewScan={() => { setResult(null); setStep(1); setData({ age: "", gender: "", concerns: [], observations: [], query: "" }); }} />;
  }

  if (scanning) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header isLoggedIn={true} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-muted-foreground" />
            <p className="text-[15px] text-muted-foreground">Analyzing…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={true} />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-xl px-5">
          <p className="text-[13px] text-hint mb-4">Step {step} of 4</p>

          {!isSubscribed && scanCount !== null && (
            <div className="mb-4 rounded-[10px] border bg-card px-4 py-3 text-sm text-muted-foreground">
              {scanCount < 3
                ? `${3 - scanCount} free scan${3 - scanCount === 1 ? "" : "s"} remaining`
                : "You've used your free scans. "}
              {scanCount >= 3 && (
                <button
                  onClick={() => navigate({ to: "/account" })}
                  className="text-foreground underline underline-offset-4"
                >
                  Subscribe to continue
                </button>
              )}
            </div>
          )}

          <div className="rounded-[14px] bg-card p-5">
            {step === 1 && (
              <StepAboutChild
                age={data.age}
                gender={data.gender}
                onChangeAge={(v) => setData({ ...data, age: v })}
                onChangeGender={(v) => setData({ ...data, gender: v })}
              />
            )}
            {step === 2 && (
              <StepConcerns
                selected={data.concerns}
                onToggle={(item) => setData({ ...data, concerns: toggleItem(data.concerns, item) })}
              />
            )}
            {step === 3 && (
              <StepObservations
                selected={data.observations}
                onToggle={(item) => setData({ ...data, observations: toggleItem(data.observations, item) })}
              />
            )}
            {step === 4 && (
              <StepQuery
                value={data.query}
                onChange={(v) => setData({ ...data, query: v })}
              />
            )}
          </div>

          <div className="mt-5 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <div className="flex items-center gap-3">
                {(step === 1 || step === 3) && (
                  <button
                    onClick={() => setStep(step + 1)}
                    className="text-[12px] text-hint hover:text-muted-foreground transition-colors"
                  >
                    Skip this step
                  </button>
                )}
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canAdvance()}
                >
                  Next
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canAdvance() || !canScan}
              >
                Get my report
              </Button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StepAboutChild({
  age,
  gender,
  onChangeAge,
  onChangeGender,
}: {
  age: string;
  gender: string;
  onChangeAge: (v: string) => void;
  onChangeGender: (v: string) => void;
}) {
  const ages = Array.from({ length: 8 }, (_, i) => String(i + 11));
  const genders = ["Boy", "Girl", "Nonbinary", "Prefer not to say"];

  return (
    <div>
      <h2 className="text-xl font-medium text-foreground mb-1">Tell us a little about your child</h2>
      <p className="text-[13px] text-hint mb-5">
        This helps us give you more relevant context. Nothing you share here is stored or shared.
      </p>

      <div className="mb-5">
        <label className="label-text mb-2 block">How old are they?</label>
        <select
          value={age}
          onChange={(e) => onChangeAge(e.target.value)}
          className="flex h-10 w-full rounded-[10px] border border-input bg-background px-3 py-2 text-[15px] text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Select age</option>
          {ages.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-text mb-2 block">How do they identify?</label>
        <div className="flex flex-wrap gap-2">
          {genders.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChangeGender(gender === g ? "" : g)}
              className={`rounded-[20px] border px-3 py-1 text-sm transition-colors ${
                gender === g
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "bg-background text-secondary-foreground border-border"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepConcerns({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-medium text-foreground mb-1">What brought you here?</h2>
      <p className="text-[13px] text-hint mb-5">Select everything that applies.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {CONCERN_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`rounded-[20px] border px-3 py-1.5 text-sm text-left transition-colors ${
              selected.includes(option)
                ? "bg-primary text-primary-foreground border-transparent"
                : "bg-background text-secondary-foreground border-border"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <p className="text-[12px] text-hint leading-relaxed">
        is this ok? currently covers content related to gender-based attitudes, masculinity culture, and body image and eating. We're expanding coverage over time.
      </p>
    </div>
  );
}

function StepObservations({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-medium text-foreground mb-1">What have you noticed?</h2>
      <p className="text-[13px] text-hint mb-1">Check all that apply</p>
      <p className="text-[13px] text-hint mb-5">
        You don't need to have the right words for this. Just check what feels true.
      </p>

      <div className="flex flex-wrap gap-2">
        {OBSERVATION_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`rounded-[20px] border px-3 py-1.5 text-sm text-left transition-colors ${
              selected.includes(option)
                ? "bg-primary text-primary-foreground border-transparent"
                : "bg-background text-secondary-foreground border-border"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepQuery({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-medium text-foreground mb-1">What specifically do you want to understand?</h2>
      <p className="text-[13px] text-hint mb-5">
        A name, a word, a phrase, a game, a community — anything.
      </p>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='e.g. Andrew Tate, "sigma male", Fresh & Fit, "looksmaxxing", a Roblox game...'
        className="min-h-[100px] mb-3"
      />

      <div className="flex flex-wrap gap-2">
        {AUTOFILL_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onChange(value ? `${value}, ${chip}` : chip)}
            className="rounded-[20px] border border-border bg-background px-3 py-1 text-sm text-secondary-foreground hover:bg-accent transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultView({ result, onNewScan }: { result: ScanResult; onNewScan: () => void }) {
  const riskVariant = (level: string) => {
    switch (level) {
      case "low": return "low" as const;
      case "concerning": return "concerning" as const;
      case "high": return "high" as const;
      default: return "neutral" as const;
    }
  };

  const riskLabel = (level: string) => {
    switch (level) {
      case "low": return "Low risk";
      case "concerning": return "Concerning";
      case "high": return "High risk";
      default: return "Unknown";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={true} />
      <main className="flex-1 py-10">
        <div className="mx-auto max-w-xl px-5">
          <h1 className="text-2xl font-medium text-foreground mb-1">Your report</h1>
          <p className="text-sm text-muted-foreground mb-6">Here's what we found.</p>

          <div className="rounded-[14px] border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={riskVariant(result.risk_level)}>
                {riskLabel(result.risk_level)}
              </Badge>
            </div>
            <p className="text-[15px] text-foreground mb-4 leading-relaxed">
              {result.summary}
            </p>
            <div className="rounded-[10px] bg-background border p-4">
              <p className="label-text mb-2">Orientation</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {result.guidance}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <Button variant="outline" onClick={onNewScan}>Scan something else</Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
