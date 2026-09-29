import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { track } from "@/lib/track";
import { ChevronDown, Copy, Check } from "lucide-react";
import { SOURCES } from "@/content/sources";

export type LensKey = "being_harmed" | "harming_others" | "harming_self";

export interface ReportV2Data {
  result_type: "report_v2";
  input_type: "description" | "lookup";
  in_scope: "core" | "adjacent" | "out_of_scope";
  escalation_category: string;
  recognized: "known_term" | "known_creator" | "described_event" | "unrecognized";
  short_answer: string;
  how_sure: string;
  how_sure_reason: string;
  does_not_tell_us: string;
  lenses: { key: LensKey; why: string }[];
  would_change_picture: { more_concerning: string[]; less_concerning: string[] };
  next_step: { action: string; why: string };
  conversation: {
    opener: string;
    questions: string[];
    boundary_statement?: string;
    repair_step?: string;
    disclosure_response?: string;
  };
  why_it_matters?: string;
  source_ids: string[];
}

const LENS_QUESTION: Record<LensKey, string> = {
  being_harmed: "Is my kid being harmed?",
  harming_others: "Is my kid harming someone else?",
  harming_self: "Is my kid harming themselves?",
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border/80 pt-7">
      <h2 className="label-text mb-4 text-primary">{title.toUpperCase()}</h2>
      {children}
    </section>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border border-border/80 bg-card px-4 py-3 text-[16px] leading-[1.55] text-muted-foreground">
      {children}
    </p>
  );
}

function CopyLine({ label, text, field }: { label?: string; text: string; field: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4">
      {label && <p className="mb-1 text-[14px] font-medium text-hint">{label}</p>}
      <p className="text-[18px] leading-[1.55] text-foreground">{text}</p>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          track("conversation_copied", { field });
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }}
        className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-[15px] text-foreground hover:border-primary/60"
        aria-label={`Copy: ${text}`}
      >
        {copied ? <Check size={16} className="text-primary" /> : <Copy size={16} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

const body = "text-[18px] leading-[1.6] text-foreground max-w-[65ch]";

export function ReportV2({ result, actions, afterWhatToSay }: { result: ReportV2Data; actions?: ReactNode; afterWhatToSay?: ReactNode }) {
  const [openWhy, setOpenWhy] = useState(false);
  const outOfScope = result.in_scope === "out_of_scope";
  const sources = SOURCES.filter((s) => result.source_ids?.includes(s.id));
  const c = result.conversation;
  const w = result.would_change_picture;
  const hasWhy = !!result.why_it_matters || sources.length > 0;

  return (
    <article className="space-y-7">
      <header className="space-y-4">
        <p className="label-text text-primary">WHAT WE FOUND</p>
        {result.recognized === "unrecognized" && !outOfScope && (
          <Note>We don't recognize this term or creator, so this answer is general.</Note>
        )}
        {outOfScope && (
          <Note>
            This tool focuses on respect, boundaries, pressure, and online sexual harm, so this answer is general.
          </Note>
        )}
        {result.in_scope === "adjacent" && (
          <Note>This is outside the tool's main focus, so treat it as a starting point.</Note>
        )}
        <p className="font-display text-[22px] font-medium leading-[1.45] text-foreground md:text-[24px] max-w-[62ch]">
          {result.short_answer}
        </p>
        {!outOfScope && result.how_sure && (
          <p className="text-[16px] leading-[1.55] text-muted-foreground">
            <span className="font-medium text-foreground">How sure this is: </span>
            {result.how_sure[0].toUpperCase() + result.how_sure.slice(1)}. {result.how_sure_reason}
          </p>
        )}
      </header>

      {!outOfScope && result.does_not_tell_us && (
        <Section title="What this does not tell us">
          <p className={body}>{result.does_not_tell_us}</p>
        </Section>
      )}

      {!outOfScope && result.lenses?.length > 0 && (
        <Section title="Your three questions">
          <ul className="space-y-4">
            {result.lenses.map((l) => (
              <li key={l.key} className="rounded-2xl border border-border/80 bg-card p-4">
                <p className="text-[18px] font-medium text-foreground">{LENS_QUESTION[l.key]}</p>
                <p className="mt-1 text-[17px] leading-[1.55] text-muted-foreground">{l.why}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {!outOfScope && (w?.more_concerning?.length > 0 || w?.less_concerning?.length > 0) && (
        <Section title="What would change the picture">
          <div className="grid gap-5 md:grid-cols-2">
            {w.more_concerning.length > 0 && (
              <div>
                <p className="mb-2 text-[17px] font-medium text-foreground">More concerning if</p>
                <ul className="list-disc space-y-1.5 pl-5 text-[17px] leading-[1.55] text-muted-foreground">
                  {w.more_concerning.map((x) => <li key={x}>{x}</li>)}
                </ul>
              </div>
            )}
            {w.less_concerning.length > 0 && (
              <div>
                <p className="mb-2 text-[17px] font-medium text-foreground">Less concerning if</p>
                <ul className="list-disc space-y-1.5 pl-5 text-[17px] leading-[1.55] text-muted-foreground">
                  {w.less_concerning.map((x) => <li key={x}>{x}</li>)}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {result.next_step?.action && (
        <Section title="A next step">
          <p className="text-[18px] font-medium leading-[1.55] text-foreground max-w-[65ch]">{result.next_step.action}</p>
          {result.next_step.why && (
            <p className="mt-2 text-[17px] leading-[1.55] text-muted-foreground max-w-[65ch]">{result.next_step.why}</p>
          )}
        </Section>
      )}

      {!outOfScope && (c?.opener || c?.questions?.length > 0) && (
        <Section title="What to say">
          <div className="space-y-3">
            {c.opener && <CopyLine field="opener" label="To open" text={c.opener} />}
            {c.questions?.map((q) => <CopyLine key={q} field="question" label="To ask" text={q} />)}
            {c.boundary_statement && <CopyLine field="boundary" label="A boundary" text={c.boundary_statement} />}
            {c.repair_step && <CopyLine field="repair" label="Making it right" text={c.repair_step} />}
            {c.disclosure_response && <CopyLine field="disclosure" label="If they tell you something hard" text={c.disclosure_response} />}
          </div>
          {afterWhatToSay}
        </Section>
      )}

      {!outOfScope && hasWhy && (
        <section className="border-t border-border/80 pt-7">
          <button
            type="button"
            onClick={() => { if (!openWhy) track("why_expanded"); setOpenWhy(!openWhy); }}
            aria-expanded={openWhy}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="label-text text-primary">WHY THIS MATTERS</span>
            <ChevronDown size={18} className={`text-hint transition-transform ${openWhy ? "rotate-180" : ""}`} />
          </button>
          {openWhy && (
            <div className="mt-4 space-y-4">
              {result.why_it_matters && <p className={body}>{result.why_it_matters}</p>}
              {sources.length > 0 && (
                <ul className="space-y-2">
                  {sources.map((s) => (
                    <li key={s.id}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[17px] text-primary underline underline-offset-4"
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      )}

      {actions}

      <section className="border-t border-border/80 pt-7">
        <h2 className="label-text mb-3 text-primary">GET MORE HELP</h2>
        <p className="text-[17px] text-muted-foreground">
          If this feels bigger than a conversation,{" "}
          <Link to="/help" onClick={() => track("get_help_clicked", { page: "result" })} className="text-primary underline underline-offset-4">
            see who can help
          </Link>
          .
        </p>
      </section>
    </article>
  );
}
