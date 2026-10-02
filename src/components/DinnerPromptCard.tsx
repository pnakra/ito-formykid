import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsStudy } from "@/lib/entrySource";
import { track } from "@/lib/track";
import { DINNER_PROMPT_ENABLED } from "@/config/features";
import { AGE_BANDS, promptForWeek, weekKey, type AgeBand } from "@/content/dinnerPrompts";

const BAND_KEY = "itok_dinner_band";
const OUTCOMES = [
  { key: "talked", label: "We talked" },
  { key: "shut_down", label: "They shut down" },
  { key: "didnt_get_to_it", label: "Didn't get to it" },
] as const;

function BandPicker({ value, onChange, label }: { value: AgeBand; onChange: (b: AgeBand) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-2">
      {AGE_BANDS.map((b) => (
        <button
          key={b}
          type="button"
          role="radio"
          aria-checked={value === b}
          onClick={() => onChange(b)}
          className={`rounded-full border px-4 py-1.5 text-[16px] transition-colors ${
            value === b ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          {b}
        </button>
      ))}
    </div>
  );
}

export function DinnerPromptCard() {
  const isStudy = useIsStudy();
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const [band, setBand] = useState<AgeBand>("13-15");
  const [outcome, setOutcome] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [subBand, setSubBand] = useState<AgeBand>("13-15");
  const [subState, setSubState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const week = weekKey();

  useEffect(() => {
    const saved = localStorage.getItem(BAND_KEY);
    const b: AgeBand = saved === "16-18" ? "16-18" : "13-15";
    setBand(b);
    setSubBand(b);
    setReady(true);
  }, []);

  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    if (!ready || isStudy) return;
    track("dinner_prompt_viewed", { week, age_band: band });
  }, [ready, isStudy, band]);

  if (!DINNER_PROMPT_ENABLED || !ready || isStudy) return null;

  const prompt = promptForWeek(band);

  const changeBand = (b: AgeBand) => {
    setBand(b);
    setSubBand(b);
    setOutcome(null);
    localStorage.setItem(BAND_KEY, b);
  };

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) { setSubState("error"); return; }
    setSubState("busy");
    const { error } = await supabase.from("dinner_prompt_subscribers").insert({ email: clean, age_band: subBand });
    if (error) { setSubState("error"); return; }
    track("dinner_prompt_subscribed", { age_band: subBand });
    setSubState("done");
  };

  return (
    <section aria-labelledby="dinner-q" className="mt-10 rounded-3xl border border-border/80 bg-card p-6 text-left">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p id="dinner-q" className="label-text text-primary">THIS WEEK'S QUESTION</p>
        <BandPicker value={band} onChange={changeBand} label="Your kid's age" />
      </div>
      <p className="mt-4 font-display text-[24px] font-semibold leading-snug text-foreground">{prompt.question}</p>
      <p className="mt-3 text-[17px] text-muted-foreground">{prompt.why}</p>
      <p className="mt-3 text-[17px] text-foreground"><span className="text-hint">If they open up: </span>{prompt.if_they_open_up}</p>

      <div className="mt-6 border-t border-border/80 pt-5">
        <p className="text-[17px] font-medium text-foreground">How did it go?</p>
        {outcome ? (
          <p role="status" className="mt-3 text-[17px] text-muted-foreground">Thanks for telling us.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {OUTCOMES.map((o) => (
              <Button
                key={o.key}
                variant="outline"
                size="sm"
                className="rounded-full text-[16px]"
                onClick={() => { setOutcome(o.key); track("dinner_prompt_feedback", { week, age_band: band, outcome: o.key }); }}
              >
                {o.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-border/80 pt-5">
        <p className="text-[17px] font-medium text-foreground">Get it every week by email</p>
        {subState === "done" ? (
          <p role="status" className="mt-3 text-[17px] text-foreground">You're in. The first one arrives next week.</p>
        ) : (
          <form onSubmit={subscribe} className="mt-3 space-y-3">
            <label htmlFor="dinner-email" className="sr-only">Email</label>
            <Input
              id="dinner-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (subState === "error") setSubState("idle"); }}
              className="h-12 text-[17px]"
            />
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[16px] text-muted-foreground">Age</span>
              <BandPicker value={subBand} onChange={setSubBand} label="Age for the weekly email" />
            </div>
            {subState === "error" && <p role="alert" className="text-[16px] text-error">Please check the email and try again.</p>}
            <Button type="submit" disabled={subState === "busy"} className="h-auto min-h-12 max-w-full whitespace-normal rounded-full px-5 py-2 text-center text-[16px] sm:px-8 sm:text-[17px]">
              {subState === "busy" ? "Saving…" : "Send me the weekly question"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
