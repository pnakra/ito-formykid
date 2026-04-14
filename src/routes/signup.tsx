import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — is this ok?" },
      { name: "description", content: "Create your is this ok? for parents account. 3 free scans included." },
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
      <div className="min-h-screen flex flex-col">
        <Header isLoggedIn={false} />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="mx-auto max-w-sm px-5 text-center">
            <h1 className="text-2xl font-medium text-foreground mb-2">
              Check your email
            </h1>
            <p className="text-muted-foreground">
              We sent a confirmation link to <span className="text-foreground">{email}</span>. Click it to activate your account.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={false} />
      <main className="flex-1 flex items-center justify-center py-16">
        <div className="mx-auto w-full max-w-sm px-5">
          <h1 className="text-2xl font-medium text-foreground mb-1 text-center">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Free lookups to start. No credit card required.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              {loading ? "Creating account…" : "Get started"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-foreground underline underline-offset-4">
              Log in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
