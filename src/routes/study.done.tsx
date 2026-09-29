import { track, anonId } from "@/lib/track";
import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { Header, Footer } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { PROLIFIC_COMPLETION_CODE } from "@/config/features";
import { getPid } from "@/lib/entrySource";

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
  is_parent_11_18: string;
  tool_purpose: string;
  could_not_tell: string;
  tone_rating: string;
  would_use_words: string;
  would_use_words_why: string;
  vs_google_chatgpt: string;
  problem_wording: string;
  helped_decide: string;
  follow_up_ok: string;
  attention_check: string;
};

const EMPTY: Answers = {
  is_parent_11_18: "",
  tool_purpose: "",
  could_not_tell: "",
  tone_rating: "",
  would_use_words: "",
  would_use_words_why: "",
  vs_google_chatgpt: "",
  problem_wording: "",
  helped_decide: "",
  follow_up_ok: "",
  attention_check: "",
};

const REQUIRED: { key: keyof Answers; label: string }[] = [
  { key: "is_parent_11_18", label: "Are you a parent of a child aged 11 to 18?" },
  { key: "tool_purpose", label: "What is this tool for?" },
  { key: "tone_rating", label: "How did the results feel?" },
  { key: "would_use_words", label: "Would you use the words?" },
  { key: "helped_decide", label: "Did this help you decide?" },
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
    const miss = REQUIRED.filter((r) => !a[r.key].trim()).map((r) => r.label);
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
      is_parent_11_18: orNull(a.is_parent_11_18),
      tool_purpose: orNull(a.tool_purpose),
      could_not_tell: orNull(a.could_not_tell),
      tone_rating: a.tone_rating ? Number(a.tone_rating) : null,
      would_use_words: orNull(a.would_use_words),
      would_use_words_why: orNull(a.would_use_words_why),
      vs_google_chatgpt: orNull(a.vs_google_chatgpt),
      problem_wording: orNull(a.problem_wording),
      helped_decide: orNull(a.helped_decide),
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

            <Question label="Are you a parent or guardian of a child aged 11 to 18?">
              <Choices
                name="parent"
                value={a.is_parent_11_18}
                onChange={set("is_parent_11_18")}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
              />
            </Question>

            <Question label="In your own words, what is this tool for?">{text("tool_purpose")}</Question>

            <Question label="In the last scenario you typed in, what did the tool say it could NOT tell you about the child?">
              {text("could_not_tell")}
            </Question>

            <Question label="How did the joke and screenshot results feel?">
              <Choices
                name="tone"
                value={a.tone_rating}
                onChange={set("tone_rating")}
                options={[
                  { value: "1", label: "1 Too alarming" },
                  { value: "2", label: "2" },
                  { value: "3", label: "3 About right" },
                  { value: "4", label: "4" },
                  { value: "5", label: "5 Too dismissive" },
                ]}
              />
            </Question>

            <Question label="Would you use the suggested conversation words with a real teen?">
              <Choices
                name="words"
                value={a.would_use_words}
                onChange={set("would_use_words")}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "yes_with_edits", label: "Yes, with edits" },
                  { value: "no", label: "No" },
                ]}
              />
              <label className="block pt-2 text-[16px] text-muted-foreground">Why?</label>
              {text("would_use_words_why")}
            </Question>

            <Question label="What does this give you that Google or ChatGPT would not?">
              {text("vs_google_chatgpt")}
            </Question>

            <Question label="Was any wording preachy, scary, invasive, or unusable? Which?">
              {text("problem_wording")}
            </Question>

            <Question label="Did this help you decide what to do next?">
              <Choices
                name="decide"
                value={a.helped_decide}
                onChange={set("helped_decide")}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "somewhat", label: "Somewhat" },
                  { value: "no", label: "No" },
                ]}
              />
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
