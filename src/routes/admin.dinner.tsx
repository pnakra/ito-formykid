import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Header, Footer } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getDinnerAdmin } from "@/lib/dinner.functions";
import { AGE_BANDS, promptForWeek, weekKey } from "@/content/dinnerPrompts";

type Data = Awaited<ReturnType<typeof getDinnerAdmin>>;

export const Route = createFileRoute("/admin/dinner")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Dinner question admin — is this ok for my kid?" },
    { name: "description", content: "Private view of weekly question subscribers and feedback." },
    { property: "og:title", content: "Dinner question admin — is this ok for my kid?" },
    { property: "og:description", content: "Private view of weekly question subscribers and feedback." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: DinnerAdmin,
});

const OUTCOMES = [["talked", "We talked"], ["shut_down", "They shut down"], ["didnt_get_to_it", "Didn't get to it"]] as const;

function csvCell(v: string) {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function DinnerAdmin() {
  const { user, loading } = useAuth();
  const load = useServerFn(getDinnerAdmin);
  const [data, setData] = useState<Data | null>(null);
  const [state, setState] = useState<"checking" | "denied" | "ok">("checking");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) { setState("denied"); return; }
    load().then((d) => { setData(d); setState("ok"); }).catch(() => setState("denied"));
  }, [loading, user]);

  const copy = async (band: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(band);
    setTimeout(() => setCopied(""), 1500);
  };

  const downloadCsv = () => {
    if (!data) return;
    const rows = [["email", "age_band", "unsubscribe_link"], ...data.subscribers.map((s) => [s.email, s.age_band, s.unsubscribe_url])];
    const blob = new Blob([rows.map((r) => r.map(csvCell).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `dinner-subscribers-${weekKey()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const card = "rounded-2xl border border-border/80 bg-card p-5";
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isLoggedIn={!!user} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <h1 className="font-display text-[32px] font-bold text-foreground">Weekly question</h1>
        {state === "checking" ? <p className="mt-5 text-hint">Checking access.</p> : state === "denied" ? <p className="mt-5 text-error">Not allowed. Sign in with your account.</p> : data && (
          <div className="mt-6 space-y-6">
            <p className="text-hint">Week {weekKey()}</p>
            {AGE_BANDS.map((b) => {
              const p = promptForWeek(b);
              const text = `${p.question}\n\nWhy: ${p.why}\n\nIf they open up: ${p.if_they_open_up}`;
              return (
                <section key={b} className={card}>
                  <p className="label-text text-primary">AGES {b}</p>
                  <p className="mt-2 font-display text-[22px] font-semibold text-foreground">{p.question}</p>
                  <p className="mt-2 text-muted-foreground">{p.why}</p>
                  <p className="mt-2 text-foreground"><span className="text-hint">If they open up: </span>{p.if_they_open_up}</p>
                  <Button variant="outline" size="sm" className="mt-4 rounded-full" onClick={() => copy(b, text)}>{copied === b ? "Copied" : "Copy"}</Button>
                </section>
              );
            })}
            <section className={card}>
              <p className="label-text text-primary">ACTIVE SUBSCRIBERS</p>
              <div className="mt-3 flex flex-wrap gap-6 text-foreground">
                {AGE_BANDS.map((b) => <p key={b}><span className="text-hint">{b}: </span><span className="font-semibold">{data.countsByBand[b] ?? 0}</span></p>)}
                <p><span className="text-hint">Total: </span><span className="font-semibold">{data.subscribers.length}</span></p>
              </div>
              <Button className="mt-4 rounded-full" onClick={downloadCsv} disabled={!data.subscribers.length}>Download CSV</Button>
            </section>
            <section className={card}>
              <p className="label-text text-primary">HOW DID IT GO? (TAPS BY WEEK)</p>
              {Object.keys(data.feedback).length === 0 ? <p className="mt-3 text-hint">No taps yet.</p> : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-foreground">
                    <thead className="text-hint"><tr><th className="py-2 pr-4">Week</th>{OUTCOMES.map(([, l]) => <th key={l} className="py-2 pr-4">{l}</th>)}</tr></thead>
                    <tbody>{Object.entries(data.feedback).sort(([a], [b]) => b.localeCompare(a)).map(([w, c]) => (
                      <tr key={w} className="border-t border-border/80"><td className="py-2 pr-4">{w}</td>{OUTCOMES.map(([k]) => <td key={k} className="py-2 pr-4">{c[k] ?? 0}</td>)}</tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
