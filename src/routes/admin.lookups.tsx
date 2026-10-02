import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Header, Footer } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getLookupsAdmin } from "@/lib/lookupsAdmin.functions";

type Rows = Awaited<ReturnType<typeof getLookupsAdmin>>;

export const Route = createFileRoute("/admin/lookups")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Lookups admin — is this ok for my kid?" },
    { name: "description", content: "Private view of saved lookups and feedback." },
    { property: "og:title", content: "Lookups admin — is this ok for my kid?" },
    { property: "og:description", content: "Private view of saved lookups and feedback." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: LookupsAdmin,
});

function csvCell(v: string) {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function LookupsAdmin() {
  const { user, loading } = useAuth();
  const load = useServerFn(getLookupsAdmin);
  const [rows, setRows] = useState<Rows>([]);
  const [state, setState] = useState<"checking" | "denied" | "ok">("checking");

  useEffect(() => {
    if (loading) return;
    if (!user) { setState("denied"); return; }
    load().then((d) => { setRows(d); setState("ok"); }).catch(() => setState("denied"));
  }, [loading, user]);

  const downloadCsv = () => {
    if (!rows.length) return;
    const keys = Object.keys(rows[0]) as (keyof Rows[number])[];
    const out = [keys.join(","), ...rows.map((r) => keys.map((k) => csvCell(String(r[k] ?? ""))).join(","))];
    const blob = new Blob([out.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `lookups-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isLoggedIn={!!user} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <h1 className="font-display text-[32px] font-bold text-foreground">Lookups</h1>
        {state === "checking" ? <p className="mt-5 text-hint">Checking access.</p> : state === "denied" ? <p className="mt-5 text-error">Not allowed. Sign in with your account.</p> : (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-hint">{rows.length} saved (kept 1 year)</p>
              <Button className="rounded-full" onClick={downloadCsv} disabled={!rows.length}>Download CSV</Button>
            </div>
            {rows.slice(0, 200).map((r) => (
              <section key={r.id} className="rounded-2xl border border-border/80 bg-card p-5">
                <p className="text-[14px] text-hint">{new Date(r.created_at).toLocaleString()} · {r.source} · {r.input_type}{r.safety_category ? ` · ${r.safety_category}` : ""}</p>
                <p className="mt-2 whitespace-pre-wrap break-words text-foreground">{r.query_text}</p>
                {r.short_answer && <p className="mt-2 text-muted-foreground">{r.short_answer}</p>}
                {r.helped && <p className="mt-2 text-foreground"><span className="text-hint">Helped: </span>{r.helped}{r.feedback_comment ? ` — ${r.feedback_comment}` : ""}</p>}
              </section>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
