import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — is this ok for my kid?" },
      { name: "description", content: "Set a new password for your is this ok for my kid? account." },
      { property: "og:title", content: "Choose a new password — is this ok for my kid?" },
      { property: "og:description", content: "Set a new password for your is this ok for my kid? account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    // Recovery links arrive with type=recovery in the URL hash.
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
      return;
    }
    // The session may already be established from the recovery link.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      } else {
        setInvalid(true);
      }
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      navigate({ to: "/home" });
    }
  };

  if (invalid) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="px-6 md:px-10 py-6">
          <Link to="/" className="text-[18px] text-muted-foreground hover:text-foreground transition-colors">
            ← Back
          </Link>
        </header>
        <main className="flex-1 flex items-start justify-center pt-[12vh] pb-16 px-6 md:px-10">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-[30px] font-bold text-foreground leading-[1.25] mb-3">
              This link has expired
            </h1>
            <p className="text-[18px] text-muted-foreground leading-relaxed mb-8">
              Password reset links only work once and expire quickly. Request a
              new one.
            </p>
            <Button asChild className="h-12 w-full rounded-full">
              <Link to="/forgot-password">Send a new reset link</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-[17px] text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-6 md:px-10 py-6">
        <Link to="/" className="text-[18px] text-muted-foreground hover:text-foreground transition-colors">
          ← Back
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center pt-[12vh] pb-16 px-6 md:px-10">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-[30px] font-bold text-foreground leading-[1.25] mb-2">
            Choose a new password
          </h1>
          <p className="text-[17px] text-muted-foreground leading-relaxed mb-8">
            Pick a new password for your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-text mb-1.5 block">New password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a new password"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-error">{error}</p>
            )}

            <Button type="submit" className="h-12 w-full rounded-full" disabled={loading}>
              {loading ? "Saving…" : "Save new password"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
