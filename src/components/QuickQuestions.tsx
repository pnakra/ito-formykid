import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveStudyAnswers } from "@/lib/studyAnswers";
import { tickTask, getTasks, type TaskKey } from "@/lib/studyTasks";

export type QQ = {
  key: string;
  label: string;
  type: "choice" | "text";
  options?: { value: string; label: string }[];
  required?: boolean;
  showIf?: (a: Record<string, string>) => boolean;
};

export const SCALE = [
  { value: "1", label: "1 Too alarming" },
  { value: "2", label: "2" },
  { value: "3", label: "3 About right" },
  { value: "4", label: "4" },
  { value: "5", label: "5 Too dismissive" },
];
export const YES_EDITS_NO = [
  { value: "yes", label: "Yes" },
  { value: "yes_with_edits", label: "Yes, with edits" },
  { value: "no", label: "No" },
];
export const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export function ChoicePills({
  value, options, onChange, label,
}: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; label: string }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`min-h-12 rounded-full border px-5 text-[16px] transition-colors ${
              active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:border-primary/60"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function QuickQuestions({ pageKey, questions }: { pageKey: TaskKey; questions: QQ[] }) {
  const [a, setA] = useState<Record<string, string>>({});
  const [missing, setMissing] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(() => !!getTasks()[pageKey]);

  const visible = questions.filter((q) => !q.showIf || q.showIf(a));

  const submit = async () => {
    const miss = visible.filter((q) => q.required && !(a[q.key] ?? "").trim()).map((q) => q.label);
    setMissing(miss);
    if (miss.length) return;
    setBusy(true);
    setError("");
    const out: Record<string, string> = {};
    for (const q of visible) if ((a[q.key] ?? "").trim()) out[q.key] = a[q.key].trim().slice(0, 1000);
    const ok = await saveStudyAnswers(pageKey, out);
    setBusy(false);
    if (!ok) { setError("That didn't save. Please try again."); return; }
    tickTask(pageKey);
    setDone(true);
  };

  if (done) {
    return (
      <section className="rounded-3xl border border-border/80 bg-card p-5">
        <p className="text-[17px] text-foreground">Thanks. Next task is at the top of the page.</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-border/80 bg-card p-5 lg:p-6" aria-label="Quick questions">
      <p className="label-text mb-5 text-primary">Quick questions</p>
      <div className="space-y-7">
        {visible.map((q) => (
          <fieldset key={q.key}>
            <legend className="mb-3 text-[18px] font-medium leading-snug text-foreground">
              {q.label}{!q.required && <span className="text-hint font-normal"> (optional)</span>}
            </legend>
            {q.type === "choice" ? (
              <ChoicePills label={q.label} value={a[q.key] ?? ""} options={q.options!} onChange={(v) => setA((p) => ({ ...p, [q.key]: v }))} />
            ) : (
              <Textarea
                aria-label={q.label}
                value={a[q.key] ?? ""}
                maxLength={1000}
                onChange={(e) => setA((p) => ({ ...p, [q.key]: e.target.value }))}
                className="min-h-[88px] text-[17px]"
              />
            )}
          </fieldset>
        ))}
      </div>
      {missing.length > 0 && (
        <div role="alert" className="mt-6 rounded-2xl border border-error/60 bg-background p-4">
          <p className="text-[17px] font-medium text-foreground">Please answer these first:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[16px] text-error">
            {missing.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </div>
      )}
      {error && <p className="mt-4 text-[16px] text-error">{error}</p>}
      <Button type="button" size="lg" onClick={submit} disabled={busy} className="mt-6 h-12 w-full rounded-full sm:w-auto sm:px-8">
        {busy ? "Sending…" : "Submit"}
      </Button>
    </section>
  );
}
