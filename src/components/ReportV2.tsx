import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Copy, Check, ArrowRight, MessageCircle, Heart, Compass, MessagesSquare, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/track";
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
  clarifying_question?: string;
}

const LENS_QUESTION: Record<LensKey, string> = {
  being_harmed: "Is my kid being harmed?",
  harming_others: "Is my kid harming someone else?",
  harming_self: "Is my kid harming themselves?",
};

const body = "text-[18px] leading-[1.6] text-foreground";

function Step({ icon: Icon, title, children, last = false }: { icon: LucideIcon; title: string; children: ReactNode; last?: boolean }) {
  return (
    <section className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-5">
      <div className="flex flex-col items-center" aria-hidden="true">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary bg-primary/10 text-primary"><Icon size={15} strokeWidth={2} /></span>
        {!last && <span className="mt-2 w-px flex-1 bg-border" />}
      </div>
      <div className={`min-w-0 ${last ? "pb-2" : "pb-10 sm:pb-12"}`}>
        <h2 className="mb-3 font-display text-[22px] font-medium leading-tight text-foreground">{title}</h2>
        {children}
      </div>
    </section>
  );
}

function CopyLine({ label, text, field }: { label?: string; text: string; field: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="border-l-2 border-primary/60 pl-4">
      {label && <p className="mb-1 text-[14px] font-medium text-muted-foreground">{label}</p>}
      <p className={body}>{text}</p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            track("conversation_copied", { field });
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch { setCopied(false); }
        }}
        className="mt-2 -ml-3 gap-2 text-primary"
        aria-label={`Copy: ${text}`}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

export function ReportV2({ result, actions, afterWhatToSay }: { result: ReportV2Data; actions?: ReactNode; afterWhatToSay?: ReactNode }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [conversationOpen, setConversationOpen] = useState(false);
  const outOfScope = result.in_scope === "out_of_scope";
  const sources = SOURCES.filter((s) => result.source_ids?.includes(s.id));
  const c = result.conversation;
  const w = result.would_change_picture;
  const hasConversation = !outOfScope && !!(c?.opener || c?.questions?.length || c?.boundary_statement || c?.repair_step || c?.disclosure_response);
  const hasMoreConversation = !!(c?.questions?.length || c?.boundary_statement || c?.repair_step || c?.disclosure_response);
  const hasDetails = !!result.does_not_tell_us || !!result.how_sure || !!result.lenses?.length || !!w?.more_concerning?.length || !!w?.less_concerning?.length || sources.length > 0;

  return (
    <article className="min-w-0">
      <p className="label-text mb-8 text-primary">YOUR REPORT</p>
      <div>
        <Step icon={MessageCircle} title="The short answer">
          <p className={body}>{result.short_answer}</p>
          {result.recognized === "unrecognized" && !outOfScope && <p className="mt-3 text-[16px] text-muted-foreground">We don't recognize this term or creator, so this answer is general.</p>}
          {outOfScope && <p className="mt-3 text-[16px] text-muted-foreground">This tool focuses on respect, boundaries, pressure, and online sexual harm, so this answer is general.</p>}
          {result.in_scope === "adjacent" && <p className="mt-3 text-[16px] text-muted-foreground">This is outside the tool's main focus, so treat it as a starting point.</p>}
        </Step>

        <Step icon={Heart} title="Why this matters" last={!result.next_step?.action && !hasConversation}>
          <p className={body}>{result.why_it_matters || (outOfScope ? "This may be worth a conversation, but this tool cannot tell you more about it from what you shared." : "What you shared is a starting point, not a verdict about your child. What matters is the context and how it affects them.")}</p>
        </Step>

        {result.next_step?.action && (
          <Step icon={Compass} title="A next step" last={!hasConversation}>
            <p className={`${body} font-medium`}>{result.next_step.action}</p>
            {result.next_step.why && <p className="mt-3 text-[17px] leading-[1.55] text-muted-foreground">{result.next_step.why}</p>}
          </Step>
        )}

        {hasConversation && (
          <Step icon={MessagesSquare} title="What to say" last>
            <div className="space-y-6">
              {c.opener && <CopyLine field="opener" label="To open" text={c.opener} />}
              {hasMoreConversation && <>
                <Button type="button" variant="ghost" aria-expanded={conversationOpen} aria-controls="more-conversation" onClick={() => setConversationOpen(!conversationOpen)} className="-ml-3 gap-2 text-primary">
                  {conversationOpen ? "Fewer conversation ideas" : "More conversation ideas"}
                  <ChevronDown size={17} className={`transition-transform ${conversationOpen ? "rotate-180" : ""}`} />
                </Button>
                {conversationOpen && <div id="more-conversation" className="space-y-6">
                  {c.questions?.map((q) => <CopyLine key={q} field="question" label="To ask" text={q} />)}
                  {c.boundary_statement && <CopyLine field="boundary" label="A boundary" text={c.boundary_statement} />}
                  {c.repair_step && <CopyLine field="repair" label="Making it right" text={c.repair_step} />}
                  {c.disclosure_response && <CopyLine field="disclosure" label="If they tell you something hard" text={c.disclosure_response} />}
                </div>}
              </>}
            </div>
            {afterWhatToSay}
          </Step>
        )}
      </div>

      {hasDetails && (
        <section className="mt-10 border-t border-border pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => { if (!detailsOpen) track("why_expanded"); setDetailsOpen(!detailsOpen); }}
            aria-expanded={detailsOpen}
            aria-controls="report-details"
            className="-ml-3 flex h-auto w-[calc(100%+0.75rem)] items-center justify-between gap-3 py-2 text-left font-display text-[19px] text-foreground hover:text-primary"
          >
            <span>More context &amp; sources</span>
            <ChevronDown size={20} className={`shrink-0 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
          </Button>
          {detailsOpen && (
            <div id="report-details" className="space-y-8 pt-6">
              {!outOfScope && result.does_not_tell_us && <div>
                <h3 className="mb-2 font-display text-[18px] text-foreground">What this can't tell us</h3>
                <p className="whitespace-pre-line text-[17px] leading-[1.6] text-muted-foreground">{result.does_not_tell_us}</p>
              </div>}
              {!outOfScope && result.how_sure && <div>
                <h3 className="mb-2 font-display text-[18px] text-foreground">How sure this is</h3>
                <p className="text-[17px] leading-[1.6] text-muted-foreground">{result.how_sure[0].toUpperCase() + result.how_sure.slice(1)}. {result.how_sure_reason}</p>
              </div>}
              {!outOfScope && result.lenses?.length > 0 && <div>
                <h3 className="mb-3 font-display text-[18px] text-foreground">Questions to keep in mind</h3>
                <ul className="space-y-4">{result.lenses.map((l) => <li key={l.key} className="border-l border-border pl-4"><p className="font-medium text-foreground">{LENS_QUESTION[l.key]}</p><p className="mt-1 text-[17px] leading-[1.55] text-muted-foreground">{l.why}</p></li>)}</ul>
              </div>}
              {!outOfScope && (w?.more_concerning?.length > 0 || w?.less_concerning?.length > 0) && <div>
                <h3 className="mb-3 font-display text-[18px] text-foreground">What would change the picture</h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  {w.more_concerning?.length > 0 && <div><p className="font-medium text-foreground">More concerning if</p><ul className="mt-2 list-disc space-y-1 pl-5 text-[17px] leading-[1.55] text-muted-foreground">{w.more_concerning.map((x) => <li key={x}>{x}</li>)}</ul></div>}
                  {w.less_concerning?.length > 0 && <div><p className="font-medium text-foreground">Less concerning if</p><ul className="mt-2 list-disc space-y-1 pl-5 text-[17px] leading-[1.55] text-muted-foreground">{w.less_concerning.map((x) => <li key={x}>{x}</li>)}</ul></div>}
                </div>
              </div>}
              {sources.length > 0 && <div><h3 className="mb-2 font-display text-[18px] text-foreground">Sources</h3><ul className="space-y-2">{sources.map((s) => <li key={s.id}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[17px] text-primary underline underline-offset-4">{s.title}</a></li>)}</ul></div>}
            </div>
          )}
        </section>
      )}

      {actions && <div className="mt-10">{actions}</div>}

      <section className="mt-10 border-t border-border pt-7">
        <details className="group">
          <summary className="cursor-pointer list-none font-display text-[19px] text-foreground">
            Need more help?
          </summary>
          <p className="mt-2 text-[17px] text-muted-foreground">If this feels bigger than a conversation, <Link to="/help" onClick={() => track("get_help_clicked", { page: "result" })} className="inline-flex items-center gap-1 text-primary underline underline-offset-4">see who can help <ArrowRight size={15} aria-hidden="true" /></Link>.</p>
        </details>
      </section>
    </article>
  );
}