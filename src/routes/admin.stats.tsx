import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { getAdminStats } from "@/lib/adminStats.functions";

export const Route = createFileRoute("/admin/stats")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Stats — is this ok for my kid?" },
      { name: "description", content: "Admin usage counts and feedback." },
      { property: "og:title", content: "Stats — is this ok for my kid?" },
      { property: "og:description", content: "Admin usage counts and feedback." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const { user, loading } = useAuth();
  const fetchStats = useServerFn(getAdminStats);
  type Stats = Awaited<ReturnType<typeof getAdminStats>>;
  const [q, setQ] = useState<{ isLoading: boolean; error: boolean; data: Stats | null }>({ isLoading: true, error: false, data: null });
  useEffect(() => {
    if (!user) return;
    fetchStats()
      .then((data) => setQ({ isLoading: false, error: false, data }))
      .catch(() => setQ({ isLoading: false, error: true, data: null }));
  }, [user]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isLoggedIn={!!user} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 space-y-10">
        <h1 className="font-display text-[28px] font-bold text-foreground">Stats</h1>
        {loading ? null : !user ? (
          <p className="text-muted-foreground">Sign in first.</p>
        ) : q.isLoading ? (
          <p className="text-muted-foreground">Loading.</p>
        ) : q.error || !q.data ? (
          <p className="text-error">Not allowed.</p>
        ) : (
          <>
            <section className="overflow-x-auto">
              <h2 className="label-text text-primary mb-3">EVENTS BY SOURCE</h2>
              <table className="w-full text-left text-[15px] text-foreground">
                <thead className="text-hint">
                  <tr><th className="py-2 pr-4">Event</th>{q.data.sources.map((s) => <th key={s} className="py-2 pr-4">{s}</th>)}<th className="py-2">Total</th></tr>
                </thead>
                <tbody>
                  {Object.entries(q.data.counts).sort().map(([ev, bySrc]) => (
                    <tr key={ev} className="border-t border-border/60">
                      <td className="py-2 pr-4">{ev}</td>
                      {q.data!.sources.map((s) => <td key={s} className="py-2 pr-4">{bySrc[s] ?? 0}</td>)}
                      <td className="py-2">{Object.values(bySrc).reduce((a, b) => a + b, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <section className="overflow-x-auto">
              <h2 className="label-text text-primary mb-3">FEEDBACK ({q.data.feedback.length})</h2>
              <table className="w-full text-left text-[14px] text-foreground">
                <thead className="text-hint">
                  <tr>{["When", "Source", "PID", "Sample", "Scope", "Safety", "Helped", "Comment"].map((h) => <th key={h} className="py-2 pr-3">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {q.data.feedback.map((f) => (
                    <tr key={f.id} className="border-t border-border/60 align-top">
                      <td className="py-2 pr-3 whitespace-nowrap">{new Date(f.created_at).toLocaleString()}</td>
                      <td className="py-2 pr-3">{f.source}</td>
                      <td className="py-2 pr-3">{f.pid ?? ""}</td>
                      <td className="py-2 pr-3">{f.sample_id ?? ""}</td>
                      <td className="py-2 pr-3">{f.in_scope ?? ""}</td>
                      <td className="py-2 pr-3">{f.safety_category ?? ""}</td>
                      <td className="py-2 pr-3">{f.helped}</td>
                      <td className="py-2 max-w-[24rem] whitespace-pre-wrap">{f.comment ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
