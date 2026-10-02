import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { track, currentSource } from "@/lib/track";
import { getPid } from "@/lib/entrySource";

const MAX = 500;
type Helped = "yes" | "somewhat" | "no";

export function FeedbackBox({
  inScope, safetyCategory, sampleId, lookupId,
}: { lookupId?: string | null; inScope?: string | null; safetyCategory?: string | null; sampleId?: string | null }) {
  const [helped, setHelped] = useState<Helped | null>(null);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!helped) return;
    setBusy(true);
    const source = currentSource();
    const text = comment.trim().slice(0, MAX);
    await supabase.from("feedback").insert({
      source,
      pid: source === "prolific" ? getPid() : null,
      sample_id: sampleId ?? null,
      lookup_id: lookupId ?? null,
      in_scope: inScope ?? null,
      safety_category: safetyCategory ?? null,
      helped,
      comment: text || null,
    } as any);
    track("feedback_submitted", { helped, has_comment: !!text });
    setSent(true);
    setBusy(false);
  };

  if (sent) {
    return (
      <section className="border-t border-border/80 pt-7">
        <p className="text-[18px] text-foreground">Thanks</p>
      </section>
    );
  }

  return (
    <section className="border-t border-border/80 pt-7 space-y-4">
      <h2 className="text-[18px] font-medium text-foreground">Did this help you decide what to do next?</h2>
      <div className="flex flex-wrap gap-2">
        {(["yes", "somewhat", "no"] as Helped[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setHelped(v)}
            aria-pressed={helped === v}
            className={`min-h-11 rounded-full border px-5 text-[16px] transition-colors ${
              helped === v ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:border-primary/60"
            }`}
          >
            {v === "yes" ? "Yes" : v === "somewhat" ? "Somewhat" : "No"}
          </button>
        ))}
      </div>
      {helped && (
        <div className="space-y-2">
          <label htmlFor="fb-comment" className="text-[16px] text-muted-foreground">
            What felt missing, unclear, or hard to trust? (optional)
          </label>
          <Textarea
            id="fb-comment"
            value={comment}
            maxLength={MAX}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px] bg-background"
          />
          <p className="text-[12px] text-hint">{comment.length} / {MAX}</p>
          <Button onClick={submit} disabled={busy}>Send</Button>
        </div>
      )}
    </section>
  );
}
