import { track, anonId } from "@/lib/track";
import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { Header, Footer } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { PROLIFIC_COMPLETION_CODE } from "@/config/features";
import { getPid } from "@/lib/entrySource";
import { MOCKUPS } from "@/components/mockups";

const TITLE = "Finish study — is this ok for my kid?";
const DESC = "A few short questions to finish the study.";

export const Route = createFileRoute("/study/done")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudyDone,
});

type Answers = {
  tool_purpose: string;
  vs_google_chatgpt: string;
  problem_wording: string;
  follow_up_ok: string;
  attention_check: string;
  mockup_picks: string[];
};

const EMPTY: Answers = {
  tool_purpose: "",
  vs_google_chatgpt: "",
  problem_wording: "",
  follow_up_ok: "",
  attention_check: "",
  mockup_picks: [],
};

const REQUIRED: { key: keyof Answers; label: string }[] = [
  { key: "tool_purpose", label: "What is this tool for?" },
  { key: "follow_up_ok", label: "Can we invite you to a follow-up survey?" },
  { key: "attention_check", label: "The last question" },
];

function Question({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-3 text-[18px] font-medium leading-snug text-foreground">{label}</legend>
      {children}
    </fieldset>
  );
}

function Choices({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            name={name}
            onClick={() => onChange(o.value)}
            className={`min-h-12 rounded-full border px-5 text-[16px] transition-colors ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary/60"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function StudyDone() {
  const [a, setA] = useState<Answers>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [missing, setMissing] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const set = (k: keyof Answers) => (v: string) => setA((p) => ({ ...p, [k]: v }));
  const text = (k: keyof Answers) => (
    <Textarea
      value={a[k]}
      onChange={(e) => set(k)(e.target.value)}
      maxLength={3000}
      className="min-h-[96px] text-[17px]"
    />
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const miss = REQUIRED.filter((r) => !String(a[r.key]).trim()).map((r) => r.label);
    if (!a.mockup_picks.length) miss.push("Which of these would you actually use? Pick up to two.");
    setMissing(miss);
    if (miss.length) return;
    setSubmitting(true);
    setError("");
    const orNull = (s: string) => (s.trim() ? s.trim() : null);
    const { error: err } = await supabase.from("study_responses").insert({
      pid: getPid(),
      anon_id: anonId(),
      follow_up_ok: orNull(a.follow_up_ok),
      attention_check: orNull(a.attention_check),
      tool_purpose: orNull(a.tool_purpose),
      vs_google_chatgpt: orNull(a.vs_google_chatgpt),
      problem_wording: orNull(a.problem_wording),
      mockup_picks: a.mockup_picks,
    });
    setSubmitting(false);
    if (err) {
      setError("That didn't save. Please try again.");
      return;
    }
    track("study_completed");
    setDone(true);
    window.scrollTo({ top: 0 });
  };

  const copy = async () => {
    await navigator.clipboard.writeText(PROLIFIC_COMPLETION_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isLoggedIn={false} study />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-12 pb-16">
        {done ? (
          <section className="rounded-3xl border border-border/80 bg-card p-6 lg:p-8">
            <h1 className="font-display text-[28px] font-bold text-foreground">
              Thank you. Your completion code is {PROLIFIC_COMPLETION_CODE}
            </h1>
            <Button onClick={copy} size="lg" className="mt-6 h-14 rounded-full px-8 text-[18px]">
              {copied ? "Copied" : "Copy code"}
            </Button>
          </section>
        ) : (
          <form onSubmit={submit} className="space-y-10">
            <h1 className="font-display text-[32px] font-bold leading-tight text-foreground">
              A few last questions
            </h1>

            <Question label="In your own words, what is this tool for?">{text("tool_purpose")}</Question>

            <Question label="What does this give you that Google or ChatGPT would not?">
              {text("vs_google_chatgpt")}
            </Question>

            <Question label="Was any wording across the pages preachy, scary, invasive, or unusable? Which?">
              {text("problem_wording")}
            </Question>

            <Question label="Which of these would you actually use? Pick up to two.">
              <div className="grid gap-5 lg:grid-cols-2">
                {MOCKUPS.map(({ id, label, Component }) => {
                  const selected = a.mockup_picks.includes(id);
                  return <div key={id}>
                    <Button type="button" variant="outline" aria-pressed={selected} onClick={() => setA((old) => { const picks = old.mockup_picks.filter((x) => x !== "none"); return { ...old, mockup_picks: selected ? picks.filter((x) => x !== id) : picks.length < 2 ? [...picks, id] : picks }; })} className={`mb-2 h-auto min-h-11 w-full whitespace-normal text-[16px] ${selected ? "border-primary bg-primary text-primary-foreground" : ""}`}>
                      {selected ? "✓ " : ""}{label}
                    </Button>
                    <div className="pointer-events-none"><Component /></div>
                  </div>;
                })}
              </div>
              <Button type="button" variant="outline" aria-pressed={a.mockup_picks.includes("none")} onClick={() => setA((old) => ({ ...old, mockup_picks: old.mockup_picks.includes("none") ? [] : ["none"] }))} className={`mt-4 ${a.mockup_picks.includes("none") ? "border-primary bg-primary text-primary-foreground" : ""}`}>None of these</Button>
            </Question>

            <Question label="Can we invite you to a 2-minute follow-up survey in about a week?">
              <Choices
                name="follow_up"
                value={a.follow_up_ok}
                onChange={set("follow_up_ok")}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
              />
            </Question>

            <Question label="To show you're reading, select 'Somewhat' below.">
              <Choices
                name="attention"
                value={a.attention_check}
                onChange={set("attention_check")}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "somewhat", label: "Somewhat" },
                  { value: "no", label: "No" },
                ]}
              />
            </Question>

            {missing.length > 0 && (
              <div role="alert" className="rounded-2xl border border-error/60 bg-card p-5">
                <p className="text-[17px] font-medium text-foreground">Please answer these first:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[16px] text-error">
                  {missing.map((m) => <li key={m}>{m}</li>)}
                </ul>
              </div>
            )}
            {error && <p className="text-[16px] text-error">{error}</p>}
            <Button type="submit" size="lg" disabled={submitting} className="h-14 w-full rounded-full text-[18px]">
              {submitting ? "Sending…" : "Submit"}
            </Button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
