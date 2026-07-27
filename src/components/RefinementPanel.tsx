import { useEffect, useState } from "react";
import { CONCERN_OPTIONS, OBSERVATION_GROUPS, GENDER_OPTIONS, AGE_OPTIONS } from "@/config/intake";
import { Button } from "@/components/ui/button";

export interface RefinementValues {
  age: string;
  gender: string;
  concerns: string[];
  observations: string[];
}

const same = (a: RefinementValues, b: RefinementValues) =>
  a.age === b.age &&
  a.gender === b.gender &&
  a.concerns.length === b.concerns.length &&
  a.concerns.every((c) => b.concerns.includes(c)) &&
  a.observations.length === b.observations.length &&
  a.observations.every((o) => b.observations.includes(o));

export function RefinementPanel({
  values,
  onChange,
  busy,
}: {
  values: RefinementValues;
  onChange: (next: RefinementValues) => void;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<RefinementValues>(values);

  useEffect(() => {
    setDraft(values);
  }, [values]);

  const dirty = !same(draft, values);

  const toggle = (list: string[], item: string) =>
    list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

  const chip = (selected: boolean) =>
    `rounded-[8px] border px-3 py-2 text-[17px] leading-relaxed text-left transition-colors ${
      selected
        ? "bg-foreground text-background border-foreground"
        : "bg-background text-foreground border-border hover:border-foreground/30"
    }`;

  return (
    <section className="pt-8">
      <div className="border-t border-border pt-6">
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="text-[20px] font-medium text-foreground">Make this more specific</span>
          <span className="text-[17px] text-hint">{busy ? "Updating…" : open ? "Hide" : "Show"}</span>
        </button>

        {!open && (
          <p className="mt-3 text-[17px] text-muted-foreground leading-relaxed">
            Add their age or what you noticed. We'll redo the report.
          </p>
        )}

        {open && (
          <>
            <div className="mt-6 space-y-7">
              <div className="flex items-center gap-3">
                <label className="text-[17px] text-foreground" htmlFor="refine-age">Their age</label>
                <select
                  id="refine-age"
                  value={draft.age}
                  onChange={(e) => setDraft({ ...draft, age: e.target.value })}
                  className="h-10 rounded-[8px] border border-input bg-background px-3 text-[17px] text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">—</option>
                  {AGE_OPTIONS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setDraft({ ...draft, gender: draft.gender === g ? "" : g })}
                    className={chip(draft.gender === g)}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <div className="grid gap-2">
                {CONCERN_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setDraft({ ...draft, concerns: toggle(draft.concerns, c) })}
                    className={chip(draft.concerns.includes(c))}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="space-y-5">
                {OBSERVATION_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="label-text mb-2">{group.label.toUpperCase()}</p>
                    <div className="grid gap-2">
                      {group.items.map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => setDraft({ ...draft, observations: toggle(draft.observations, o) })}
                          className={chip(draft.observations.includes(o))}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-24" />

            {dirty && (
              <div className="sticky bottom-0 z-20 -mx-5 border-t border-border bg-background/95 px-5 py-4 backdrop-blur">
                <Button
                  onClick={() => onChange(draft)}
                  disabled={busy}
                  size="lg"
                  className="w-full text-[17px]"
                >
                  {busy ? "Updating the report…" : "Update the report"}
                </Button>
                <p className="mt-2 text-center text-[15px] text-hint">
                  We'll rewrite it with what you added.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
