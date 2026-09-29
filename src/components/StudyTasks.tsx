import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTasks, TASKS_EVENT, type TaskKey } from "@/lib/studyTasks";

const PROMPT =
  "My 13-year-old keeps saying a creator's phrase about how girls should act. I don't know who he is.";

const ITEMS: { key: TaskKey; label: string }[] = [
  { key: "joke", label: "Open the joke sample and answer 3 quick questions" },
  { key: "screenshot", label: "Open the screenshot sample and answer 3 quick questions" },
  { key: "image", label: "Open the image sample and answer 2 quick questions" },
  { key: "live", label: "Type this into the tool yourself, then answer 2 quick questions:" },
];

export function StudyTasks() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sync = () => setDone(getTasks());
    sync();
    setOpen(sessionStorage.getItem("itok_tasks_open") !== "0");
    window.addEventListener(TASKS_EVENT, sync);
    return () => window.removeEventListener(TASKS_EVENT, sync);
  }, []);

  const toggle = () => {
    setOpen((o) => {
      sessionStorage.setItem("itok_tasks_open", o ? "0" : "1");
      return !o;
    });
  };
  const count = ITEMS.filter((i) => done[i.key]).length;
  const all = count === ITEMS.length;

  const copy = async () => {
    await navigator.clipboard.writeText(PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-b border-border/80 bg-card">
      <div className="mx-auto max-w-3xl px-5 py-3">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span className="font-display text-[17px] font-semibold text-foreground">
            Your tasks <span className="text-hint font-normal">({count}/4)</span>
          </span>
          <ChevronDown className={`h-5 w-5 shrink-0 text-hint transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="pt-3 pb-1">
            <ol className="space-y-3">
              {ITEMS.map((item, i) => {
                const ok = !!done[item.key];
                return (
                  <li key={item.key} className="flex items-start gap-3">
                    <span
                      role="checkbox"
                      aria-checked={ok}
                      aria-label={item.label}
                      className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border ${
                        ok ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                      }`}
                    >
                      {ok && <Check className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1 text-[16px] leading-snug">
                      <span className={ok ? "text-hint line-through" : "text-foreground"}>
                        {i + 1}. {item.label}
                      </span>
                      {item.key === "live" && (
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start">
                          <p className="min-w-0 flex-1 rounded-2xl border border-border/80 bg-background p-3 text-[15px] text-muted-foreground">
                            "{PROMPT}"
                          </p>
                          <Button type="button" variant="outline" size="sm" onClick={copy} className="self-start rounded-full">
                            {copied ? "Copied" : "Copy"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            {all && (
              <Link to="/study/done" className="mt-4 block">
                <Button size="lg" className="w-full rounded-full sm:w-auto">Finish study</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
