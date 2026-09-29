import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { practiceTurn } from "@/lib/practice.functions";
import { track } from "@/lib/track";

type Exchange = { parent: string; teen?: string };

export function PracticePanel() {
  const call = useServerFn(practiceTurn);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [turns, setTurns] = useState<Exchange[]>([]);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [safety, setSafety] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parent = text.trim();
    if (!parent || parent.length > 500 || loading) return;
    setLoading(true);
    setError("");
    try {
      const messages = [...turns, { parent }];
      const answer = await call({ data: { messages } });
      if (answer.kind === "safety") { setSafety(true); setText(""); return; }
      if (answer.kind === "error") { setError(answer.message); return; }
      if (answer.kind === "reply") setTurns([...turns, { parent, teen: answer.teen }]);
      if (answer.kind === "feedback") {
        setTurns(messages);
        setFeedback(answer.lines);
        track("practice_completed", { turns: 3 });
      }
      setText("");
    } catch { setError("Practice is not ready right now."); }
    finally { setLoading(false); }
  }

  return (
    <div className="mt-5">
      {!open ? <Button type="button" onClick={() => { setOpen(true); track("practice_started"); }}>Practice it</Button> : (
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-5">
          <h3 className="font-display text-xl text-foreground">Practice it</h3>
          <p className="text-[16px] text-muted-foreground">Practice saying it. A made-up 14-year-old will answer. Three turns.</p>
          {turns.map((t, i) => <div key={i} className="space-y-2 border-t border-border/80 pt-4">
            <p className="text-[16px] text-hint">You</p><p className="text-foreground whitespace-pre-wrap">{t.parent}</p>
            {t.teen && <><p className="text-[16px] text-hint">Teen</p><p className="text-foreground whitespace-pre-wrap">{t.teen}</p></>}
          </div>)}
          {safety ? <p className="text-foreground">Please pause here. <Link to="/help" className="text-primary underline" onClick={() => track("get_help_clicked", { page: "practice" })}>Get help</Link></p> :
           feedback.length ? <div className="border-t border-border/80 pt-4"><h4 className="font-display text-lg text-foreground">What went well</h4>{feedback.map((line, i) => <p key={i} className="mt-2 text-foreground">{line}</p>)}</div> :
           <form onSubmit={submit} className="space-y-3">
             <label htmlFor="practice-words" className="text-[16px] text-foreground">What would you say? ({turns.length + 1} of 3)</label>
             <Textarea id="practice-words" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} className="min-h-24 text-[18px]" />
             <div className="flex items-center justify-between gap-3"><span className="text-sm text-hint">{text.length}/500</span><Button type="submit" disabled={loading || !text.trim()}>{loading ? "Thinking…" : "Send"}</Button></div>
           </form>}
          {error && <p role="alert" className="text-error text-[16px]">{error}</p>}
        </div>
      )}
    </div>
  );
}