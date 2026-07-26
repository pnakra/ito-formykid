import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

export interface EscalationResultData {
  result_type: "escalation";
  escalated: true;
  escalation_category: string;
  acknowledgment: string;
  why_escalated: string;
  immediate_guidance: string[];
  resources: { name: string; number: string; tel: string }[];
  what_not_to_do: string[];
}

export function EscalationResult({
  result,
  onScanAnother,
}: {
  result: EscalationResultData;
  onScanAnother: () => void;
}) {
  return (
    <article className="space-y-8">
      <header>
        <h1 className="text-[22px] font-medium leading-[1.35] text-foreground mb-2">
          {result.acknowledgment}
        </h1>
        <p className="text-[18px] text-muted-foreground leading-relaxed">
          {result.why_escalated}
        </p>
      </header>

      <section className="rounded-[14px] border bg-card p-5">
        <p className="label-text mb-4">WHO TO CALL</p>
        <div className="space-y-3">
          {result.resources.map((r) => (
            <a
              key={r.name}
              href={`tel:${r.tel}`}
              className="flex items-center gap-3 rounded-[10px] border px-4 py-3 hover:bg-accent/40 transition-colors"
            >
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1">
                <span className="block text-[18px] font-medium text-foreground leading-snug">
                  {r.name}
                </span>
                <span className="block text-[17px] text-muted-foreground">{r.number}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section>
        <p className="label-text mb-3">WHAT TO DO NOW</p>
        <ul className="space-y-2">
          {result.immediate_guidance.map((item) => (
            <li key={item} className="flex items-start gap-2 text-[18px] text-foreground leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className="label-text mb-3">WHAT NOT TO DO</p>
        <ul className="space-y-2">
          {result.what_not_to_do.map((item) => (
            <li key={item} className="flex items-start gap-2 text-[18px] text-muted-foreground leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <Button variant="outline" className="w-full" onClick={onScanAnother}>
        Look up something else
      </Button>
    </article>
  );
}
