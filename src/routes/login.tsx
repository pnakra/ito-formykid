import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — is this ok?" },
      { name: "description", content: "Log in to your is this ok? for my kid account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate({ to: "/home" });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      navigate({ to: "/home" });
    }
  };

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
            Welcome back
          </h1>
          <p className="text-[17px] text-muted-foreground leading-relaxed mb-8">
            Pick up where you left off.
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
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-risk-high-foreground">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in…" : "Log in"}
            </Button>
          </form>

          <p className="mt-6 text-[17px] text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-foreground underline underline-offset-4">
              Sign up
            </Link>
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
