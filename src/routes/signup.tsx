import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — is this ok?" },
      { name: "description", content: "Create your is this ok for my kid? account." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (user) {
    navigate({ to: "/home" });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="px-6 md:px-10 py-6">
          <Link to="/" className="text-[18px] text-muted-foreground hover:text-foreground transition-colors">
            ← Back
          </Link>
        </header>
        <main className="flex-1 flex items-start justify-center pt-[12vh] pb-16 px-6 md:px-10">
          <div className="w-full max-w-sm">
            <h1
              className="text-[26px] md:text-[30px] text-foreground leading-[1.25] mb-3"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
            >
              Check your email
            </h1>
            <p className="text-[18px] text-muted-foreground leading-relaxed">
              We sent a confirmation link to{" "}
              <span className="text-foreground">{email}</span>.
              Click it to activate your account.
            </p>
          </div>
        </main>
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
          <h1
            className="text-[26px] md:text-[30px] text-foreground leading-[1.25] mb-2"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
          >
            Create your account
          </h1>
          <p className="text-[17px] text-muted-foreground leading-relaxed mb-8">
            Save reports, track patterns over time, and stay ahead of what your child encounters online.
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
            <div>
              <label className="label-text mb-1.5 block">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-risk-high-foreground">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Get started — it's free"}
            </Button>
          </form>

          <p className="mt-6 text-[17px] text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-foreground underline underline-offset-4">
              Log in
            </Link>
          </p>

          <p className="mt-8 text-[13px] text-hint leading-relaxed">
            Your first lookups are free. You always control your data, and you can delete your account at any time.
          </p>
        </div>
      </main>

      <footer className="px-6 md:px-10 py-8 border-t border-border">
        <p className="text-[13px] text-hint leading-relaxed max-w-md">
          is this ok? is a nonprofit orientation tool for parents. We do not monitor
          devices, track children, or share your data.
        </p>
      </footer>
    </div>
  );
}
