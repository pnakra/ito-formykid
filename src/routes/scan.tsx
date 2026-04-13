import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scan content — is this ok?" },
      { name: "description", content: "Paste a URL or describe content to get a calm, clear assessment." },
    ],
  }),
  component: ScanPage,
});

interface ScanResult {
  risk_level: "low" | "concerning" | "high" | "unknown";
  summary: string;
  guidance: string;
}

function ScanPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [inputType, setInputType] = useState<"url" | "text">("url");
  const [content, setContent] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [scanCount, setScanCount] = useState<number | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("scan_count, is_subscribed")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setScanCount(data.scan_count);
            setIsSubscribed(data.is_subscribed);
          }
        });
    }
  }, [user]);

  const canScan = isSubscribed || (scanCount !== null && scanCount < 3);

  const handleScan = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    if (!canScan) {
      setError("You've used your 3 free scans. Subscribe to continue.");
      return;
    }

    setScanning(true);
    setError("");
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ content: content.trim(), inputType }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Scan failed");
      }

      const scanResult: ScanResult = await response.json();
      setResult(scanResult);

      // Save scan to DB
      await supabase.from("scans").insert({
        user_id: user.id,
        input_type: inputType,
        input_content: content.trim(),
        risk_level: scanResult.risk_level,
        summary: scanResult.summary,
        guidance: scanResult.guidance,
      });

      // Increment scan count
      const newCount = (scanCount ?? 0) + 1;
      await supabase
        .from("profiles")
        .update({ scan_count: newCount })
        .eq("id", user.id);
      setScanCount(newCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setScanning(false);
    }
  };

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
            Scan content
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Paste a URL or describe what your child encountered.
          </p>

          {!isSubscribed && scanCount !== null && (
            <div className="mb-4 rounded-[10px] border bg-card px-4 py-3 text-sm text-muted-foreground">
              {scanCount < 3
                ? `${3 - scanCount} free scan${3 - scanCount === 1 ? "" : "s"} remaining`
                : "You've used your free scans. "}
              {scanCount >= 3 && (
                <button
                  onClick={() => navigate({ to: "/account" })}
                  className="text-foreground underline underline-offset-4"
                >
                  Subscribe to continue
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleScan} className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInputType("url")}
                className={`rounded-[20px] border px-3 py-1 text-sm transition-colors ${
                  inputType === "url"
                    ? "bg-foreground text-background border-transparent"
                    : "bg-background text-muted-foreground"
                }`}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => setInputType("text")}
                className={`rounded-[20px] border px-3 py-1 text-sm transition-colors ${
                  inputType === "text"
                    ? "bg-foreground text-background border-transparent"
                    : "bg-background text-muted-foreground"
                }`}
              >
                Describe it
              </button>
            </div>

            {inputType === "url" ? (
              <Input
                type="url"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="https://tiktok.com/..."
                required
              />
            ) : (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe what you saw or what your child told you about…"
                required
              />
            )}

            {error && (
              <p className="text-sm text-risk-high-foreground">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={scanning || !canScan}>
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                "Scan this content"
              )}
            </Button>
          </form>

          {result && (
            <div className="mt-8 rounded-[14px] border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={riskVariant(result.risk_level)}>
                  {riskLabel(result.risk_level)}
                </Badge>
              </div>
              <p className="text-[15px] text-foreground mb-4 leading-relaxed">
                {result.summary}
              </p>
              <div className="rounded-[10px] bg-background border p-4">
                <p className="label-text mb-2">Orientation</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.guidance}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
