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
  "I just have a feeling something is off and I want to understand it better",
];

const OBSERVATION_OPTIONS = [
  "Comments about women or girls that concern me",
  "Comments about men or boys that seem off",
  "Something that seems unkind toward gay or transgender people",
  "They seem to care a lot about how they look in a way that worries me",
  "They've been pulling away from family or old friends",
  "A new group of people online I don't know anything about",
  "Skipping meals or talking about food in a way that worries me",
  "Saying things that sound like they came from somewhere online",
  "Acting like the adults in their life don't understand anything",
  "Something I can't quite put my finger on",
];

const AUTOFILL_CHIPS = ["looksmaxxing", "Fresh & Fit", "sigma male", "redpill"];

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
      setError("You've used your 3 free lookups. Subscribe to continue.");
      return;
    }

    sessionStorage.setItem("scanIntake", JSON.stringify(data));
    navigate({ to: "/results" });
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={true} />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-xl px-5">
          <p className="text-[13px] text-hint mb-4">Step {step} of 4</p>

          {!isSubscribed && scanCount !== null && (
            <div className="mb-4 rounded-[10px] border bg-card px-4 py-3 text-sm text-muted-foreground">
              {scanCount < 3
                ? `${3 - scanCount} free lookup${3 - scanCount === 1 ? "" : "s"} remaining`
                : "You've used your free lookups. "}
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

          {error && (
            <p className="text-sm text-risk-high-foreground mt-3">{error}</p>
          )}

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
                    Skip this step →
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
              <div className="flex flex-col items-end gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!canAdvance() || !canScan}
                >
                  Look it up
                </Button>
                <p className="text-[12px] text-hint leading-relaxed text-right max-w-[260px]">
                  We'll explain what it is, why young people are drawn to it, and how to talk about it.
                </p>
              </div>
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
      <h2 className="text-xl font-medium text-foreground mb-1">First, tell us a little about your child</h2>
      <p className="text-[13px] text-hint mb-5">
        This helps us give you more useful information. You don't have to fill everything in.
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
        <label className="label-text mb-1 block">How do they identify?</label>
        <p className="text-[12px] text-hint mb-2">
          If you're not sure, that's okay — just leave it blank.
        </p>
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
      <h2 className="text-xl font-medium text-foreground mb-1">What made you want to look something up today?</h2>
      <p className="text-[13px] text-hint mb-5">Tap everything that feels right. There are no wrong answers.</p>

      <div className="flex flex-wrap gap-2">
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
      <p className="text-[13px] text-hint mb-5">
        You don't need the right words for this. Just check what feels true, even if you can't explain it yet.
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
      <h2 className="text-xl font-medium text-foreground mb-1">What specifically do you want to look up?</h2>
      <p className="text-[13px] text-hint mb-5">
        This can be a name, a word, a phrase, a game, a video — whatever it is you heard or saw. Even if you don't know what it means, type it in.
      </p>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. a name you heard, a word they used, an app they're always on..."
        className="min-h-[100px] mb-4"
      />

      <p className="text-[12px] text-hint mb-2">
        Not sure where to start? Some things other parents have looked up:
      </p>
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
