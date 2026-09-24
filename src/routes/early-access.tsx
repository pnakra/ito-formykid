import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinWaitlist } from "@/lib/earlyAccess.functions";

const TITLE = "is this ok? for my kid — early access";
const DESC =
  "A calm guide for parents. Describe what you noticed online, get plain context and one good way to talk about it. Free, from a nonprofit.";

export const Route = createFileRoute("/early-access")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EarlyAccessPage,
});

const serif = { fontFamily: "var(--font-serif)", fontWeight: 400 } as const;

function EarlyAccessPage() {
  const join = useServerFn(joinWaitlist);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setError("Please check your email address.");
      return;
    }
    setLoading(true);
    const p = new URLSearchParams(window.location.search);
    try {
      const res = await join({
        data: {
          email: value,
          name: name.trim() || null,
          utm_source: p.get("utm_source"),
          utm_medium: p.get("utm_medium"),
          utm_campaign: p.get("utm_campaign"),
          utm_content: p.get("utm_content"),
          utm_term: p.get("utm_term"),
          referrer: document.referrer || null,
          landing_path: window.location.pathname + window.location.search,
        },
      });
      if (res.ok) {
        setDone(true);
        window.scrollTo(0, 0);
      } else setError("Something went wrong. Please try again.");
    } catch {
      setError("Please check your email address.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-xl items-center px-5">
          <span className="text-[15px] font-medium tracking-[0.06em] text-hint">is this ok? for my kid</span>
        </div>
      </header>

      <main className="flex-1">
        {done ? (
          <section className="mx-auto max-w-xl px-5 pt-14 pb-20">
            <h1 className="text-[28px] md:text-[34px] leading-[1.25] mb-4 text-foreground" style={serif}>
              You're on the list.
            </h1>
            <p className="text-[18px] text-muted-foreground leading-[1.7] mb-3">
              We'll email <span className="text-foreground">{email.trim()}</span> when early access opens. That's the only email you'll get until then.
            </p>
            <p className="text-[18px] text-muted-foreground leading-[1.7]">
              Changed your mind? Reply to that email and we'll delete your address.
            </p>
          </section>
        ) : (
          <>
            <section className="mx-auto max-w-xl px-5 pt-10 pb-12 md:pt-14">
              <h1 className="text-[28px] md:text-[36px] leading-[1.2] mb-4 text-foreground" style={serif}>
                A calm second opinion for parents.
              </h1>
              <p className="text-[18px] text-muted-foreground leading-[1.65] mb-7">
                Saw something on your kid's phone, or heard a new word at dinner? Describe it. Get plain context and one good way to bring it up.
              </p>

              <form onSubmit={submit} className="space-y-3" noValidate>
                <label htmlFor="email" className="label-text block">Email</label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 text-[18px]"
                  required
                />
                <Input
                  aria-label="First name (optional)"
                  autoComplete="given-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First name (optional)"
                  className="h-12 text-[18px]"
                />
                {error && <p className="text-[15px] text-destructive">{error}</p>}
                <Button type="submit" size="lg" disabled={loading} className="w-full h-12 text-[17px]">
                  {loading ? "Saving…" : "Get early access"}
                </Button>
                <p className="text-[15px] text-hint leading-[1.6]">
                  We'll email you once, when early access opens. Free. No spam.
                </p>
              </form>
            </section>

            <section className="bg-card py-12">
              <div className="mx-auto max-w-xl px-5 space-y-8">
                <div>
                  <p className="label-text mb-3">WHO IT'S FOR</p>
                  <p className="text-[18px] text-foreground leading-[1.7]">
                    Parents of kids and teens who want to understand, not spy. Think of it as a consent coach for the online stuff.
                  </p>
                </div>
                <div>
                  <p className="label-text mb-3">WHAT YOU GET</p>
                  <ul className="text-[18px] text-foreground leading-[1.7] space-y-2">
                    <li>What it is, in plain words.</li>
                    <li>Whether it's common for their age.</li>
                    <li>What not to say.</li>
                    <li>One easy way to start the talk.</li>
                  </ul>
                </div>
                <div>
                  <p className="label-text mb-3">WHAT EARLY ACCESS MEANS</p>
                  <p className="text-[18px] text-foreground leading-[1.7]">
                    We're letting parents in a small group at a time. You'll be among the first, and your feedback shapes what we build.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        <section className="py-12">
          <div className="mx-auto max-w-xl px-5">
            <p className="label-text mb-3">YOUR PRIVACY</p>
            <ul className="text-[17px] text-muted-foreground leading-[1.7] space-y-2">
              <li>We're a nonprofit. We never sell or share your data.</li>
              <li>We keep your email, your first name if you give it, and which link brought you here.</li>
              <li>We use it only to tell you when early access opens.</li>
              <li>We never see your child's phone, accounts, or messages.</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-xl px-5 flex items-center justify-between text-[15px] text-hint">
          <span>Made by Override Labs, a nonprofit.</span>
          <Link to="/unlock" className="hover:text-foreground transition-colors">Team</Link>
        </div>
      </footer>
    </div>
  );
}
