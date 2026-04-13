import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Scan history — is this ok?" },
      { name: "description", content: "Review your past content scans." },
    ],
  }),
  component: HistoryPage,
});

interface Scan {
  id: string;
  input_type: string;
  input_content: string;
  risk_level: string;
  summary: string;
  guidance: string;
  created_at: string;
}

function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      supabase
        .from("scans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setScans((data as Scan[]) ?? []);
          setLoading(false);
        });
    }
  }, [user]);

  if (authLoading) return null;

  const riskVariant = (level: string) => {
    switch (level) {
      case "low": return "low" as const;
      case "concerning": return "concerning" as const;
      case "high": return "high" as const;
      default: return "neutral" as const;
    }
  };

  const riskLabel = (level: string) => {
    switch (level) {
      case "low": return "Low risk";
      case "concerning": return "Concerning";
      case "high": return "High risk";
      default: return "Unknown";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={true} />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-xl px-5">
          <h1 className="text-2xl font-medium text-foreground mb-1">
            Scan history
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Review past scans and revisit guidance.
          </p>

          {loading ? (
            <div className="py-12 text-center text-sm text-hint">Loading…</div>
          ) : scans.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground mb-3">No scans yet.</p>
              <button
                onClick={() => navigate({ to: "/scan" })}
                className="text-sm text-foreground underline underline-offset-4"
              >
                Run your first scan
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {scans.map((scan) => (
                <button
                  key={scan.id}
                  onClick={() => setExpanded(expanded === scan.id ? null : scan.id)}
                  className="w-full text-left rounded-[14px] border bg-card p-5 transition-colors hover:border-foreground/20"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={riskVariant(scan.risk_level)}>
                        {riskLabel(scan.risk_level)}
                      </Badge>
                      <Badge variant="chip" className="text-xs">
                        {scan.input_type === "url" ? "URL" : "Text"}
                      </Badge>
                    </div>
                    <span className="text-xs text-hint whitespace-nowrap">
                      {formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground truncate">
                    {scan.input_content}
                  </p>

                  {expanded === scan.id && (
                    <div className="mt-4 space-y-3">
                      <p className="text-[15px] text-foreground leading-relaxed">
                        {scan.summary}
                      </p>
                      <div className="rounded-[10px] bg-background border p-4">
                        <p className="label-text mb-2">Orientation</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {scan.guidance}
                        </p>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
