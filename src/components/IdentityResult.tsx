import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

export interface IdentityResultData {
  result_type: "identity_affirming";
  summary_verdict?: string | null;
  identity_note: string;
  separate_concern?: string | null;
  parent_guidance: string[];
  opening_question: string;
  what_not_to_do?: string[] | null;
  resources: { name: string; number: string; tel: string }[];
}

export function IdentityResult({
  result,
  onScanAnother,
}: {
  result: IdentityResultData;
  onScanAnother: () => void;
}) {
  return (
    <article className="space-y-8">
      <header>
        <h1 className="text-[22px] font-medium leading-[1.35] text-foreground mb-2">
          This is not a risk.
        </h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed">
          {result.identity_note}
        </p>
      </header>

      {result.separate_concern && (
        <section>
          <p className="label-text mb-3">A SEPARATE THING TO LOOK AT</p>
          <p className="text-[15px] text-foreground leading-relaxed">
            {result.separate_concern}
          </p>
        </section>
      )}

      <section>
        <p className="label-text mb-3">WHAT HELPS MOST</p>
        <ul className="space-y-2">
          {result.parent_guidance.map((item) => (
            <li key={item} className="flex items-start gap-2 text-[15px] text-foreground leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {result.what_not_to_do && result.what_not_to_do.length > 0 && (
        <section>
          <p className="label-text mb-3">WHAT NOT TO DO</p>
          <ul className="space-y-2">
            {result.what_not_to_do.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[15px] text-muted-foreground leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-[14px] border bg-card p-5">
        <p className="label-text mb-3">SOMETHING TO ASK</p>
        <p className="text-[16px] text-foreground leading-relaxed">
          "{result.opening_question}"
        </p>
      </section>

      <section>
        <p className="label-text mb-3">IF YOU WANT SUPPORT</p>
        <div className="space-y-3">
          {result.resources.map((r) =>
            r.tel ? (
              <a
                key={r.name}
                href={`tel:${r.tel}`}
                className="flex items-center gap-3 rounded-[10px] border px-4 py-3 hover:bg-accent/40 transition-colors"
              >
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1">
                  <span className="block text-[15px] font-medium text-foreground leading-snug">{r.name}</span>
                  <span className="block text-[14px] text-muted-foreground">{r.number}</span>
                </span>
              </a>
            ) : (
              <div key={r.name} className="rounded-[10px] border px-4 py-3">
                <span className="block text-[15px] font-medium text-foreground leading-snug">{r.name}</span>
                <span className="block text-[14px] text-muted-foreground">{r.number}</span>
              </div>
            )
          )}
        </div>
      </section>

      <Button variant="outline" className="w-full" onClick={onScanAnother}>
        Look up something else
      </Button>
    </article>
  );
}
