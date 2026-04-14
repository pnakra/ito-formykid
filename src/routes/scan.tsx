import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Look something up — is this ok?" },
      { name: "description", content: "Tell us what you noticed and we'll help you understand what's going on." },
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
  "Something I heard them say",
  "Something I saw them watching or reading",
  "A game or app they've been using",
  "The way they've been acting lately",
  "A word or phrase I didn't recognize",
  "Something a teacher or other parent mentioned",
  "I just have a feeling something is off",
];

const OBSERVATION_GROUPS = [
  {
    label: "Language & attitudes",
    items: [
      "Comments about women or girls that concern me",
      "Comments about men or boys that seem off",
      "Something that seems unkind toward gay or transgender people",
      "Saying things that sound like they came from somewhere online",
    ],
  },
  {
    label: "Behavior & mood",
    items: [
      "They seem to care a lot about how they look in a way that worries me",
      "They've been pulling away from family or old friends",
      "Skipping meals or talking about food in a way that worries me",
      "Acting like the adults in their life don't understand anything",
    ],
  },
  {
    label: "Social & online",
    items: [
      "A new group of people online I don't know anything about",
      "Something I can't quite put my finger on",
    ],
  },
];

const AUTOFILL_EXAMPLES = ["looksmaxxing", "Fresh & Fit", "sigma male", "redpill"];

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

  // Payments temporarily disabled — allow unlimited scans without account
  const hasCompletedFirstScan = false;

  useEffect(() => {
    if (!authLoading && !user && hasCompletedFirstScan) {
      navigate({ to: "/signup" });
    }
  }, [user, authLoading, navigate, hasCompletedFirstScan]);

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

  // Payments temporarily disabled — always allow scanning
  const canScan = true;

  const canAdvance = () => {
    if (step === 1) return true;
    if (step === 2) return data.concerns.length > 0;
    if (step === 3) return true;
    if (step === 4) return data.query.trim().length > 0;
    return false;
  };

  const toggleItem = (list: string[], item: string): string[] =>
    list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

  const handleSubmit = () => {
    if (!data.query.trim()) return;

    if (!canScan) {
      setError("You've used your free lookups. Subscribe for ongoing access and support.");
      return;
    }

    sessionStorage.setItem("scanIntake", JSON.stringify(data));
    navigate({ to: "/results" });
  };

  if (authLoading && hasCompletedFirstScan) return null;

  const stepLabels = ["About your child", "What brought you here", "What you've noticed", "What to look up"];

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={!!user} />

      <main className="flex-1 py-10 md:py-16">
        <div className="mx-auto max-w-xl px-5">

          {/* Step indicator — calm, typographic */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className="h-[2px] flex-1 rounded-full transition-colors duration-300"
                  style={{
                    backgroundColor: s <= step ? "var(--foreground)" : "var(--border)",
                  }}
                />
              ))}
            </div>
            <p className="text-[12px] text-hint">
              {step} of 4 — {stepLabels[step - 1]}
            </p>
          </div>

          {/* Scan count notice */}
          {user && !isSubscribed && scanCount !== null && (
            <div className="mb-6 text-[13px] text-hint">
              {scanCount < 3
                ? `${3 - scanCount} free lookup${3 - scanCount === 1 ? "" : "s"} remaining`
                : (
                  <>
                    You've used your free lookups.{" "}
                    <button
                      onClick={() => navigate({ to: "/account" })}
                      className="text-foreground underline underline-offset-4"
                    >
                      Subscribe to continue
                    </button>
                  </>
                )}
            </div>
          )}

          {/* Step content */}
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

          {error && (
            <p className="text-sm text-risk-high-foreground mt-4">{error}</p>
          )}

          {/* Navigation — elegant, minimal */}
          <div className="mt-10 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 text-[13px] text-hint hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-4">
              {(step === 1 || step === 3) && (
                <button
                  onClick={() => setStep(step + 1)}
                  className="text-[13px] text-hint hover:text-foreground transition-colors"
                >
                  Skip
                </button>
              )}

              {step < 4 ? (
                <button
                  onClick={() => canAdvance() && setStep(step + 1)}
                  disabled={!canAdvance()}
                  className="flex items-center gap-1.5 text-[14px] font-medium text-foreground disabled:text-hint disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canAdvance() || !canScan}
                  size="lg"
                  className="text-[14px] px-6"
                >
                  Look it up
                </Button>
              )}
            </div>
          </div>

          {step === 4 && (
            <p className="text-[12px] text-hint mt-4 text-right max-w-[300px] ml-auto leading-relaxed">
              We'll explain what it is, why young people are drawn to it, and how to talk about it.
            </p>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ─── Step 1: About your child ─── */

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
      <h2
        className="text-[22px] md:text-[26px] text-foreground leading-[1.3] mb-2"
        style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
      >
        First, a little about your child
      </h2>
      <p className="text-[14px] text-hint leading-relaxed mb-8">
        This helps us tailor the result to their age and situation. Both fields are optional — skip anything you're not sure about.
      </p>

      <div className="mb-8">
        <label className="text-[13px] font-medium text-foreground mb-2 block">How old are they?</label>
        <select
          value={age}
          onChange={(e) => onChangeAge(e.target.value)}
          className="flex h-10 w-full max-w-[200px] rounded-[8px] border border-input bg-background px-3 py-2 text-[15px] text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Select age</option>
          {ages.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[13px] font-medium text-foreground mb-1.5 block">How do they identify?</label>
        <p className="text-[12px] text-hint mb-3">
          Some online content targets young people differently based on gender. This helps us give more relevant context.
        </p>
        <div className="flex flex-wrap gap-2">
          {genders.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChangeGender(gender === g ? "" : g)}
              className={`rounded-[8px] border px-4 py-2 text-[14px] transition-colors ${
                gender === g
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-foreground border-border hover:border-foreground/30"
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

/* ─── Step 2: What brought you here ─── */

function StepConcerns({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <div>
      <h2
        className="text-[22px] md:text-[26px] text-foreground leading-[1.3] mb-2"
        style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
      >
        What brought you here today?
      </h2>
      <p className="text-[14px] text-hint leading-relaxed mb-8">
        There are no wrong answers. Select everything that feels true.
      </p>

      <div className="space-y-2">
        {CONCERN_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`w-full text-left rounded-[8px] border px-4 py-3 text-[14px] leading-relaxed transition-colors ${
              selected.includes(option)
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-foreground border-border hover:border-foreground/30"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Step 3: What you've noticed ─── */

function StepObservations({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <div>
      <h2
        className="text-[22px] md:text-[26px] text-foreground leading-[1.3] mb-2"
        style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
      >
        What have you noticed?
      </h2>
      <p className="text-[14px] text-hint leading-relaxed mb-8">
        You don't need the right words for this. Just check what feels true, even if you can't explain it yet.
      </p>

      <div className="space-y-6">
        {OBSERVATION_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[12px] font-medium text-hint mb-2 uppercase tracking-wide">{group.label}</p>
            <div className="space-y-2">
              {group.items.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onToggle(option)}
                  className={`w-full text-left rounded-[8px] border px-4 py-3 text-[14px] leading-relaxed transition-colors ${
                    selected.includes(option)
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border hover:border-foreground/30"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Step 4: The query ─── */

function StepQuery({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h2
        className="text-[22px] md:text-[26px] text-foreground leading-[1.3] mb-2"
        style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
      >
        What do you want to understand?
      </h2>
      <p className="text-[14px] text-hint leading-relaxed mb-8">
        Type in a word, a name, a phrase, a game, a community, or a behavior. You do not need to know the right language — just describe what you noticed.
      </p>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. a name you heard, a word they used, an app they're always on…"
        className="min-h-[120px] text-[15px] leading-relaxed rounded-[8px] mb-6"
      />

      <div className="border-t border-border pt-5">
        <p className="text-[12px] text-hint mb-3">
          Not sure where to start? Some things other parents have looked up:
        </p>
        <div className="flex flex-wrap gap-2">
          {AUTOFILL_EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => onChange(value ? `${value}, ${example}` : example)}
              className="rounded-[6px] border border-border bg-background px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
