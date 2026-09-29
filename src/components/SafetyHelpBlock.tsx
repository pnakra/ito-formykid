import { useEffect } from "react";
import { track } from "@/lib/track";
import { Phone, ExternalLink } from "lucide-react";
import { SAFETY_COPY, type SafetyCategory, type HelpResource } from "@/content/safetyCopy";

export function ResourceItem({ r }: { r: HelpResource }) {
  return (
    <li className="rounded-2xl border border-border/80 bg-background/40 p-4">
      <p className="text-[18px] font-medium text-foreground">{r.name}</p>
      <p className="mt-1 text-[16px] text-muted-foreground">{r.what}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {r.phone && (
          <a
            href={`tel:${r.phone.tel}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-[16px] font-medium text-primary-foreground"
          >
            <Phone size={16} /> {r.phone.label}
          </a>
        )}
        {r.url && (
          <a
            href={r.url.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-[16px] text-foreground hover:border-primary/60"
          >
            <ExternalLink size={16} /> {r.url.label}
          </a>
        )}
      </div>
    </li>
  );
}

export function SafetyHelpBlock({ category }: { category: SafetyCategory }) {
  const block = SAFETY_COPY[category];
  useEffect(() => { track("help_block_viewed", { safety_category: category }); }, [category]);
  return (
    <section className="rounded-2xl border border-primary/50 bg-card p-5" aria-live="polite">
      <h2 className="font-display text-[22px] font-medium leading-snug text-foreground">{block.title}</h2>
      <ul className="mt-3 space-y-2 text-[17px] leading-[1.55] text-foreground">
        {block.guidance.map((g) => <li key={g}>{g}</li>)}
      </ul>
      <ul className="mt-5 space-y-3">
        {block.resources.map((r) => <ResourceItem key={r.name} r={r} />)}
      </ul>
    </section>
  );
}
