import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — is this ok for my kid?" },
      { name: "description", content: "Request a password reset link for your is this ok for my kid? account." },
      { property: "og:title", content: "Reset your password — is this ok for my kid?" },
      { property: "og:description", content: "Request a password reset link for your is this ok for my kid? account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  if (sent) {
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
              Check your email
            </h1>
            <p className="text-[18px] text-muted-foreground leading-relaxed">
              If an account exists for{" "}
              <span className="break-all text-foreground">{email}</span>, we
              sent a link to reset your password.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-6 md:px-10 py-6">
        <Link to="/login" className="text-[18px] text-muted-foreground hover:text-foreground transition-colors">
          ← Back
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center pt-[12vh] pb-16 px-6 md:px-10">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-[30px] font-bold text-foreground leading-[1.25] mb-2">
            Reset your password
          </h1>
          <p className="text-[17px] text-muted-foreground leading-relaxed mb-8">
            Enter your account email and we'll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-text mb-1.5 block">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-error">{error}</p>
            )}

            <Button type="submit" className="h-12 w-full rounded-full" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
