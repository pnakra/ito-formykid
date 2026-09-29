import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Header, Footer } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getAdminEvalAccess } from "@/lib/adminEvals.functions";
import { EVAL_CASES, SAFETY_ONLY_CASES } from "@/content/evalCases";

type EvalResult = {
  result_type?: string; in_scope?: string; safety_category?: string | null;
  recognized?: string; lenses?: { key: string }[]; short_answer?: string; error?: string;
};
type Row = { status: string; result?: EvalResult };
const MARKS_KEY = "itok_admin_eval_marks_v1";

export const Route = createFileRoute("/admin/evals")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Evals — is this ok for my kid?" },
    { name: "description", content: "Private review of fictional check cases." },
    { property: "og:title", content: "Evals — is this ok for my kid?" },
    { property: "og:description", content: "Private review of fictional check cases." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: EvalsPage,
});

function EvalsPage() {
  const { user, loading } = useAuth();
  const checkAccess = useServerFn(getAdminEvalAccess);
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [rows, setRows] = useState<Record<number, Row>>({});
  const [safetyRows, setSafetyRows] = useState<Record<number, Row>>({});
  const [marks, setMarks] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (loading) return;
    if (!user) { setChecking(false); return; }
    checkAccess().then(() => setAllowed(true)).catch(() => setAllowed(false)).finally(() => setChecking(false));
  }, [loading, user]);
  useEffect(() => {
    try { setMarks(JSON.parse(localStorage.getItem(MARKS_KEY) ?? "{}")); } catch { /* no prior marks */ }
  }, []);

  async function runCase(number: number, testMode: boolean): Promise<Row> {
    const c = EVAL_CASES[number - 1];
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return { status: "Sign in again." };
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ content: c.input, inputType: "description", intake: { query: c.input, danger_now: "danger_now" in c ? c.danger_now : "Not sure" }, test_mode: testMode }),
      });
      const result = await response.json() as EvalResult;
      return { status: response.ok ? "Done" : `Error ${response.status}`, result };
    } catch { return { status: "Could not run" }; }
  }

  async function run(numbers: readonly number[], testMode: boolean) {
    if (!allowed || busy) return;
    setBusy(true);
    for (const [index, number] of numbers.entries()) {
      setProgress(`${index + 1} / ${numbers.length}`);
      const row = await runCase(number, testMode);
      if (testMode) setSafetyRows((prev) => ({ ...prev, [number]: row }));
      else setRows((prev) => ({ ...prev, [number]: row }));
    }
    setProgress(""); setBusy(false);
  }

  function toggleMark(number: number) {
    const next = { ...marks, [number]: !marks[number] };
    setMarks(next);
    localStorage.setItem(MARKS_KEY, JSON.stringify(next));
  }

  return <div className="flex min-h-screen flex-col bg-background">
    <Header isLoggedIn={!!user} />
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
      <h1 className="font-display text-[32px] font-bold text-foreground">Evals</h1>
      {checking ? <p className="mt-5 text-hint">Checking access.</p> : !allowed ? <p className="mt-5 text-error">Not allowed. Sign in with your account.</p> : <>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button disabled={busy} className="rounded-full" onClick={() => run(EVAL_CASES.map((_, i) => i + 1), false)}>Run all</Button>
          <Button disabled={busy} variant="outline" className="rounded-full" onClick={() => run(SAFETY_ONLY_CASES, true)}>Run safety-only</Button>
          {progress && <span role="status" className="self-center text-hint">{progress}</span>}
        </div>
        <div className="mt-8 space-y-4 md:hidden">
          {EVAL_CASES.map((c, i) => { const n = i + 1; const r = rows[n]?.result; return <article key={n} className="rounded-2xl border border-border/80 bg-card p-5 text-[16px]">
            <p className="label-text text-primary">CASE {n}</p><p className="mt-2 text-foreground">{c.input}</p>
            <p className="mt-3 text-hint">Expected: {c.expected}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-foreground">
              <div><dt className="label-text">Status</dt><dd>{rows[n]?.status ?? "Not run"}</dd></div>
              <div><dt className="label-text">Scope</dt><dd>{r?.in_scope ?? "—"}</dd></div>
              <div><dt className="label-text">Safety</dt><dd>{r?.safety_category ?? "—"}</dd></div>
              <div><dt className="label-text">Recognized</dt><dd>{r?.recognized ?? "—"}</dd></div>
            </dl>
            <p className="mt-2 text-hint">Lenses: {r?.lenses?.map((l) => l.key).join(", ") || "—"}</p>
            {r?.short_answer && <p className="mt-3 text-foreground">{r.short_answer}</p>}
            {r?.error && <p className="mt-3 text-error">{r.error}</p>}
            <label className="mt-4 flex items-center gap-2 text-foreground"><input type="checkbox" checked={!!marks[n]} onChange={() => toggleMark(n)} /> Pass</label>
            {safetyRows[n] && <p className="mt-2 text-hint">Safety-only: {safetyRows[n].result?.safety_category ?? safetyRows[n].status}</p>}
          </article>; })}
        </div>
        <div className="mt-8 hidden overflow-x-auto rounded-2xl border border-border/80 bg-card md:block">
          <table className="w-full min-w-[1100px] text-left text-[15px] text-foreground">
            <thead className="label-text text-hint"><tr>{["#", "Input", "Expected", "In scope", "Safety", "Recognized", "Lenses", "Short answer", "Pass"].map((h) => <th key={h} className="p-3 align-top">{h}</th>)}</tr></thead>
            <tbody>{EVAL_CASES.map((c, i) => { const n = i + 1; const row = rows[n]; const r = row?.result; return <tr key={n} className="border-t border-border/80 align-top">
              <td className="p-3">{n}</td><td className="w-48 p-3">{c.input}</td><td className="w-40 p-3 text-hint">{c.expected}</td>
              <td className="p-3">{r?.in_scope ?? row?.status ?? "—"}</td><td className="p-3">{r?.safety_category ?? "—"}{safetyRows[n] && <p className="mt-1 text-hint">Pre: {safetyRows[n].result?.safety_category ?? safetyRows[n].status}</p>}</td>
              <td className="p-3">{r?.recognized ?? "—"}</td><td className="p-3">{r?.lenses?.map((l) => l.key).join(", ") ?? "—"}</td>
              <td className="min-w-64 p-3">{r?.short_answer ?? r?.error ?? "—"}</td>
              <td className="p-3"><input type="checkbox" aria-label={`Case ${n} pass`} checked={!!marks[n]} onChange={() => toggleMark(n)} /></td>
            </tr>; })}</tbody>
          </table>
        </div>
      </>}
    </main><Footer />
  </div>;
}
