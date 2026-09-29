import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import {
  AGE_BANDS,
  WHERE_OPTIONS,
  FREQUENCY_OPTIONS,
  QUESTION_OPTIONS,
  DANGER_OPTIONS,
  STARTERS,
  BLANK,
} from "@/config/intake";

const TITLE = "What are you trying to make sense of? — is this ok for my kid?";
const DESC = "Describe what you noticed, or look up a term or creator. Get context and a next step.";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ScanPage,
});

type Mode = "describe" | "lookup";
const MODE_KEY = "itok_input_mode";
const MAX = 1500;

function Pills({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-[17px] font-medium text-foreground">{label}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const active = value === o;
          return (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(active ? "" : o)}
              className={`min-h-11 rounded-full border px-4 text-[16px] transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/60"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ScanPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("describe");
  const [text, setText] = useState("");
  const [ageBand, setAgeBand] = useState("");
  const [where, setWhere] = useState("");
  const [frequency, setFrequency] = useState("");
  const [question, setQuestion] = useState("");
  const [danger, setDanger] = useState("");
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const storedMode = sessionStorage.getItem(MODE_KEY);
    if (storedMode === "lookup" || storedMode === "describe") setMode(storedMode);
  }, []);

  const toggleLookup = (on: boolean) => {
    const next: Mode = on ? "lookup" : "describe";
    setMode(next);
    sessionStorage.setItem(MODE_KEY, next);
  };

  const trimmed = text.trim();
  const hasBlank = text.includes(BLANK);

  const useStarter = (starter: string) => {
    setText(starter);
    requestAnimationFrame(() => {
      const el = textRef.current;
      if (!el) return;
      const at = starter.indexOf(BLANK);
      el.focus();
      el.setSelectionRange(at, at + BLANK.length);
    });
  };

  const handleSubmit = () => {
    if (danger === "Yes") {
      navigate({ to: "/help" });
      return;
    }
    if (!trimmed || hasBlank || text.length > MAX) return;
    sessionStorage.setItem(MODE_KEY, mode);
    sessionStorage.setItem(
      "scanIntake",
      JSON.stringify({
        age: "",
        age_band: ageBand,
        where,
        frequency,
        question_on_mind: question,
        danger_now: danger,
        concerns: [],
        observations: [],
        query: trimmed,
        inputMode: mode,
      }),
    );
    navigate({ to: "/results" });
  };

  if (authLoading) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isLoggedIn={!!user} />

      <main className="flex-1 py-10 md:py-16">
        <div className="mx-auto max-w-2xl px-5">
          <h1 className="font-display text-[30px] font-bold leading-[1.15] tracking-tight text-foreground md:text-[40px]">
            What are you trying to make sense of?
          </h1>

          <p className="mt-6 rounded-2xl border border-border/80 bg-card p-4 text-[18px] leading-[1.55] text-muted-foreground">
            Please leave out names, usernames, schools, contact details, passwords, and identifying
            details. Describe what happened in your own words instead of pasting private messages.
          </p>

          <label htmlFor="scan-text" className="sr-only">
            What happened
          </label>
          <Textarea
            id="scan-text"
            ref={textRef}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            maxLength={MAX}
            placeholder={
              mode === "describe"
                ? "What you saw, heard, or noticed…"
                : "A term, creator, game, or community"
            }
            className="mt-4 min-h-[170px] text-[18px] leading-relaxed"
          />
          <div className="mt-2 flex items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-[16px] text-muted-foreground">
              <input
                type="checkbox"
                checked={mode === "lookup"}
                onChange={(e) => toggleLookup(e.target.checked)}
                className="h-5 w-5 accent-[var(--color-primary)]"
              />
              I'm looking up a term or creator
            </label>
            <span
              className={`text-[14px] tabular-nums ${text.length >= MAX ? "text-error" : "text-hint"}`}
              aria-live="polite"
            >
              {text.length} / {MAX}
            </span>
          </div>

          <p className="mt-5 text-[15px] text-hint">Not sure how to start? Tap one and fill in the blank.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {STARTERS.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => useStarter(starter)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-left text-[15px] text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
              >
                {starter}
              </button>
            ))}
          </div>
          {hasBlank && (
            <p className="mt-3 text-[15px] text-hint">Replace the ___ with what happened, then tap Get context.</p>
          )}

          <div className="mt-10 space-y-8">
            <p className="label-text text-primary">OPTIONAL. SKIP ANY OF THESE.</p>
            <Pills label="Child's age" options={AGE_BANDS} value={ageBand} onChange={setAgeBand} />
            <Pills label="Where this came up" options={WHERE_OPTIONS} value={where} onChange={setWhere} />
            <Pills label="How often" options={FREQUENCY_OPTIONS} value={frequency} onChange={setFrequency} />
            <Pills
              label="Which question is on your mind?"
              options={QUESTION_OPTIONS}
              value={question}
              onChange={setQuestion}
            />
            <Pills
              label="Could someone be in danger right now?"
              options={DANGER_OPTIONS}
              value={danger}
              onChange={setDanger}
            />
            {danger === "Yes" && (
              <p className="text-[16px] text-foreground">
                We'll take you to people who can help right now.
              </p>
            )}
          </div>

          <div className="mt-10">
            <Button
              onClick={handleSubmit}
              disabled={danger !== "Yes" && (!trimmed || hasBlank)}
              size="lg"
              className="h-14 w-full rounded-full text-[18px] sm:w-auto sm:px-10"
            >
              {danger === "Yes" ? "Get help now" : "Get context"}
            </Button>
            <p className="mt-5 text-[15px] text-hint">
              We never see your child's phone, accounts, or messages.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
