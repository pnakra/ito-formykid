import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { STARTERS, BLANK } from "@/config/intake";

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
          <p className="mt-2 text-[15px] text-hint">
            What you type is sent to an AI model to write your answer.{" "}
            <Link to="/privacy" className="underline underline-offset-4 hover:text-foreground">How we handle it</Link>
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
