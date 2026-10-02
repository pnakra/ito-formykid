import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — is this ok for my kid?" },
      { name: "description", content: "Create your is this ok for my kid? account." },
      { property: "og:title", content: "Sign up — is this ok for my kid?" },
      { property: "og:description", content: "Create your is this ok for my kid? account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  if (user) {
    navigate({ to: "/home" });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      // Email is already registered — no confirmation email is sent in this case.
      setAlreadyRegistered(true);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (alreadyRegistered) {
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
              className="font-display text-[30px] font-bold text-foreground leading-[1.25] mb-3"
            >
              You already have an account
            </h1>
            <p className="text-[18px] text-muted-foreground leading-relaxed mb-8">
              <span className="break-all text-foreground">{email}</span> is
              already registered. Sign in instead — or reset your password if
              you've forgotten it.
            </p>
            <Button asChild className="h-12 w-full rounded-full">
              <Link to="/login">Sign in</Link>
            </Button>
            <p className="mt-5 text-[15px] text-muted-foreground">
              Forgot your password?{" "}
              <Link to="/forgot-password" className="text-foreground underline underline-offset-4">
                Reset it
              </Link>
            </p>
          </div>
        </main>
      </div>
    );
  }

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
              className="font-display text-[30px] font-bold text-foreground leading-[1.25] mb-3"
            >
              Check your email
            </h1>
            <p className="text-[18px] text-muted-foreground leading-relaxed">
              We sent a confirmation link to{" "}
              <span className="break-all text-foreground">{email}</span>.
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
            className="font-display text-[30px] font-bold text-foreground leading-[1.25] mb-2"
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
              <p className="text-sm text-error">{error}</p>
            )}

            <Button type="submit" className="h-12 w-full rounded-full" disabled={loading}>
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
            You always control your data, and you can delete your account at any time.
          </p>
        </div>
      </main>

      <footer className="px-6 md:px-10 py-8 border-t border-border">
        <p className="text-[13px] text-hint leading-relaxed max-w-md">
          is this ok for my kid? is a nonprofit orientation tool for parents. We do not monitor
          devices, track children, or share your data.
        </p>
      </footer>
    </div>
  );
}
