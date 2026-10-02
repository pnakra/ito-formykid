import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { STARTERS, BLANK, AGE_BANDS } from "@/config/intake";

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

function ScanPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("describe");
  const [text, setText] = useState("");
  const [ageBand, setAgeBand] = useState("");
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
      if (!el || el.value !== starter) return;
      const at = starter.indexOf(BLANK);
      el.focus();
      el.setSelectionRange(at, at + BLANK.length);
    });
  };

  const handleSubmit = () => {
    if (!trimmed || hasBlank || text.length > MAX) return;
    sessionStorage.setItem(MODE_KEY, mode);
    sessionStorage.setItem(
      "scanIntake",
      JSON.stringify({
        age: "",
        age_band: ageBand,
        concerns: [],
        observations: [],
        query: trimmed,
        inputMode: mode,
      }),
    );
    navigate({ to: "/specific" });
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

          <fieldset className="mt-6">
            <legend className="text-[16px] font-medium text-foreground">Their age (optional)</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {AGE_BANDS.map((band) => <button key={band} type="button" aria-pressed={ageBand === band} onClick={() => setAgeBand(ageBand === band ? "" : band)} className={`rounded-full border px-3 py-2 text-[15px] transition-colors ${ageBand === band ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary"}`}>{band}</button>)}
            </div>
          </fieldset>

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
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
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
          <p className="mt-2 text-[15px] text-hint">
            {"\n"}
          </p>

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

          <div className="mt-10">
            <Button
              onClick={handleSubmit}
              disabled={!trimmed || hasBlank}
              size="lg"
              className="h-14 w-full rounded-full text-[18px] sm:w-auto sm:px-10"
            >
              Continue
            </Button>
          </div>
          <p className="mt-4 text-[15px] text-hint">
            We save lookups to check the AI is answering well, not to build a profile of you. Without an account, nothing ties it back to you.{" "}
            <Link to="/privacy" className="underline underline-offset-2">Privacy</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
