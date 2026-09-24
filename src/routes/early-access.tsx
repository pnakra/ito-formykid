import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinWaitlist, getWaitlistCount } from "@/lib/earlyAccess.functions";

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

// Early access opens October 1, 2026 (Central Time).
const LAUNCH_DATE = new Date("2026-10-01T09:00:00-05:00");
const LAUNCH_LABEL = "Early access opens October 1";

function CountdownBlock() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  let parts: { value: string; label: string }[] | null = null;
  if (now !== null) {
    const diff = Math.max(0, LAUNCH_DATE.getTime() - now);
    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    const mins = Math.floor((diff % 3_600_000) / 60_000);
    const secs = Math.floor((diff % 60_000) / 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    parts = [
      { value: String(days), label: "days" },
      { value: pad(hours), label: "hours" },
      { value: pad(mins), label: "min" },
      { value: pad(secs), label: "sec" },
    ];
  }

  return (
    <div className="rounded-[14px] border border-border/60 bg-card px-5 py-4">
      <p className="label-text mb-2">{LAUNCH_LABEL.toUpperCase()}</p>
      <div className="flex items-baseline gap-5 tabular-nums">
        {parts
          ? parts.map((p) => (
              <div key={p.label} className="flex flex-col">
                <span className="text-[26px] leading-none text-foreground" style={serif}>
                  {p.value}
                </span>
                <span className="text-[13px] text-hint mt-1">{p.label}</span>
              </div>
            ))
          : (
            <span className="text-[26px] leading-none text-hint" style={serif}>
              —
            </span>
          )}
      </div>
    </div>
  );
}

function ValueCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-[14px] bg-card border border-border/60 flex gap-4">
      <div
        aria-hidden
        className="w-5 h-5 mt-0.5 rounded-full border border-primary shrink-0 flex items-center justify-center"
      >
        <span className="w-2 h-2 rounded-full bg-primary" />
      </div>
      <div>
        <p className="label-text mb-1">{label}</p>
        <div className="text-[15px] leading-relaxed text-foreground">{children}</div>
      </div>
    </div>
  );
}

function EarlyAccessPage() {
  const join = useServerFn(joinWaitlist);
  const count = useServerFn(getWaitlistCount);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [signups, setSignups] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    count().then((r) => setSignups(r.count)).catch(() => {});
  }, [count]);

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

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + "/early-access");
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-xl items-center px-5">
          <span className="text-[15px] font-medium tracking-[0.06em] text-hint">is this ok? for my kid</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-10 pb-16">
        {done ? (
          <section className="pt-4">
            <h1 className="text-[28px] md:text-[34px] leading-[1.25] mb-4 text-foreground" style={serif}>
              You're on the list.
            </h1>
            <p className="text-[18px] text-muted-foreground leading-[1.7] mb-3">
              We'll email <span className="text-foreground">{email.trim()}</span> when early access opens on October 1. That's the only email you'll get until then.
            </p>
            <p className="text-[18px] text-muted-foreground leading-[1.7]">
              Changed your mind? Reply to that email and we'll delete your address.
            </p>
            <div className="mt-6 p-4 rounded-[14px] bg-card border border-border/60">
              <p className="label-text mb-2">KNOW ANOTHER PARENT?</p>
              <p className="text-[15px] text-muted-foreground leading-[1.6] mb-3">
                Send them this page. Everyone on the list hears first.
              </p>
              <Button variant="outline" size="sm" onClick={copyLink}>
                {copied ? "Copied" : "Copy page link"}
              </Button>
            </div>
          </section>
        ) : (
          <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-3">
              <h1 className="text-[30px] md:text-[34px] leading-[1.2] text-foreground" style={serif}>
                A calm second opinion for parents.
              </h1>
              <p className="text-[18px] leading-[1.6] text-muted-foreground">
                Saw something on your kid's phone? Describe it. Get plain answers and one good way to talk about it.
              </p>
            </header>

            <CountdownBlock />

            <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
              <Input
                aria-label="First name (optional)"
                autoComplete="given-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name (optional)"
                className="h-12 text-[18px] bg-card"
              />
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-12 text-[18px] bg-card"
                required
              />
              {error && <p className="text-[15px] text-destructive">{error}</p>}
              <Button type="submit" size="lg" disabled={loading} className="w-full h-12 text-[17px]">
                {loading ? "Saving…" : "Get early access"}
              </Button>
              <p className="text-[15px] text-hint leading-[1.6]">
                Free. No spam. One email on October 1.
                {signups !== null && signups > 0 ? ` You'd join ${signups} ${signups === 1 ? "parent" : "parents"}.` : ""}
              </p>
            </form>

            <div className="grid gap-3">
              <ValueCard label="WHO IT'S FOR">
                Parents who want to understand, not spy. A consent coach for the online stuff.
              </ValueCard>
              <ValueCard label="WHAT YOU GET">
                What it is, in plain words. Whether it's common, and one way to start the talk.
              </ValueCard>
              <ValueCard label="WHAT EARLY ACCESS MEANS">
                We invite a small group at a time. Your feedback shapes what we build.
              </ValueCard>
            </div>

            <section className="pt-4 border-t border-border">
              <div className="bg-primary/5 rounded-[14px] p-4">
                <p className="label-text mb-3">YOUR PRIVACY</p>
                <ul className="text-[15px] leading-[1.6] text-muted-foreground grid gap-2">
                  <li className="flex items-start gap-2">
                    <span aria-hidden className="mt-2 w-1.5 h-1.5 rounded-full bg-hint shrink-0" />
                    Nonprofit. We never sell or share your data.
                  </li>
                  <li className="flex items-start gap-2">
                    <span aria-hidden className="mt-2 w-1.5 h-1.5 rounded-full bg-hint shrink-0" />
                    We keep your email and first name, only to tell you when access opens.
                  </li>
                  <li className="flex items-start gap-2">
                    <span aria-hidden className="mt-2 w-1.5 h-1.5 rounded-full bg-hint shrink-0" />
                    We never see your child's phone, accounts, or messages.
                  </li>
                </ul>
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-md px-5 flex items-center justify-between text-[15px] text-hint">
          <span>Made by Override Labs, a nonprofit.</span>
          <Link to="/unlock" className="hover:text-foreground transition-colors">Team</Link>
        </div>
      </footer>
    </div>
  );
}
