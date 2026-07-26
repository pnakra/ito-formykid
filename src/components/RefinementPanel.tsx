import { useState } from "react";
import { CONCERN_OPTIONS, OBSERVATION_GROUPS, GENDER_OPTIONS, AGE_OPTIONS } from "@/config/intake";

export interface RefinementValues {
  age: string;
  gender: string;
  concerns: string[];
  observations: string[];
}

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

  const toggle = (list: string[], item: string) =>
    list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

  const chip = (selected: boolean) =>
    `rounded-[8px] border px-3 py-2 text-[13px] leading-relaxed text-left transition-colors ${
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
          <span className="text-[15px] font-medium text-foreground">Make this more specific</span>
          <span className="text-[13px] text-hint">{busy ? "Updating…" : open ? "Hide" : "Show"}</span>
        </button>

        {open && (
          <div className="mt-6 space-y-7">
            <div className="flex items-center gap-3">
              <label className="text-[13px] text-foreground" htmlFor="refine-age">Their age</label>
              <select
                id="refine-age"
                value={values.age}
                onChange={(e) => onChange({ ...values, age: e.target.value })}
                className="h-9 rounded-[8px] border border-input bg-background px-3 text-[14px] text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                  onClick={() => onChange({ ...values, gender: values.gender === g ? "" : g })}
                  className={chip(values.gender === g)}
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
                  onClick={() => onChange({ ...values, concerns: toggle(values.concerns, c) })}
                  className={chip(values.concerns.includes(c))}
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
                        onClick={() => onChange({ ...values, observations: toggle(values.observations, o) })}
                        className={chip(values.observations.includes(o))}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
