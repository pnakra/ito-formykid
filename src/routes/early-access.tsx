import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ShieldAlert, Sparkles, Lock } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinWaitlist } from "@/lib/earlyAccess.functions";

const TITLE = "is this ok? for my kid — early access";
const DESC =
  "Tell us what you saw or heard. Find out if your kid is at risk, causing harm, or just being a teen.";

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

// Early access opens October 1, 2026, 5:00 PM Central Time.
const LAUNCH_DATE = new Date("2026-10-01T17:00:00-05:00");

type Role = "parent" | "aunt_uncle" | "grandparent" | "educator";
const ROLES: { value: Role; label: string }[] = [
  { value: "parent", label: "I have kids" },
  { value: "aunt_uncle", label: "I'm an aunt, uncle, or pibling" },
  { value: "grandparent", label: "I have grandkids" },
  { value: "educator", label: "I work with kids as a teacher or coach" },
];

function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const diff = now === null ? 0 : Math.max(0, LAUNCH_DATE.getTime() - now);
  const pad = (n: number) => String(n).padStart(2, "0");
  const parts = [
    { v: pad(Math.floor(diff / 86_400_000)), l: "days" },
    { v: pad(Math.floor((diff % 86_400_000) / 3_600_000)), l: "hrs" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 lg:gap-3">
      {parts.map((p) => (
        <div
          key={p.l}
          className="rounded-2xl bg-card border border-border/80 py-3 text-center lg:rounded-3xl lg:py-5"
        >
          <div className="font-display text-[30px] leading-none font-bold tabular-nums text-primary lg:text-[40px]">
            {now === null ? "––" : p.v}
          </div>
          <div className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-hint">
            {p.l}
          </div>
        </div>
      ))}
    </div>
  );
}

function Tile({
  tag,
  title,
  body,
  className = "",
  icon,
}: {
  tag: string;
  title: string;
  body: string;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <div
      className={`rounded-3xl bg-card border border-border/80 p-5 lg:p-7 ${className}`}
    >
      <span className="inline-block rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] bg-primary/15 text-primary">
        {tag}
      </span>
      <h3 className="mt-3 flex items-center gap-2.5 text-[20px] font-bold text-foreground">
        {icon && (
          <span
            aria-hidden
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 lg:flex"
          >
            {icon}
          </span>
        )}
        {title}
      </h3>
      <p className="mt-1.5 text-[16px] leading-[1.55] text-muted-foreground">
        {body}
      </p>
    </div>
  );
}

function EarlyAccessPage() {
  const join = useServerFn(joinWaitlist);
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

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
          roles,
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
      await navigator.clipboard.writeText(
        window.location.origin + "/early-access",
      );
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="theme-launch relative isolate min-h-screen flex flex-col">
      
      <div className="relative flex-1 w-full max-w-lg mx-auto px-5 pt-8 pb-8 lg:max-w-3xl lg:px-10 lg:pt-14 lg:pb-12">
        <div className="flex items-center justify-between">
          <span className="font-display text-[17px] font-bold tracking-tight text-foreground">
             is this ok? for my kid
          </span>
          <span className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[12px] font-medium text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Early access
          </span>
        </div>

        {done ? (
          <section className="mt-16 lg:max-w-xl">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full bg-primary"
              aria-hidden
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-7 w-7 text-background"
              >
                <path
                  d="M5 12.5 10 17.5 19 7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="mt-6 text-[34px] leading-[1.15] font-bold text-foreground">
              You're on the list.
            </h1>
            <p className="mt-4 text-[18px] leading-[1.6] text-muted-foreground">
              Your email is saved. We'll write to{" "}
              <span className="text-primary">{email.trim()}</span> when early
              access opens. That's the only email you'll get.
            </p>

            <div className="mt-8 rounded-3xl bg-card border border-border/80 p-5">
              <h3 className="text-[20px] font-bold text-foreground">
                Know another parent?
              </h3>
              <p className="mt-1.5 text-[16px] text-muted-foreground">
                Send them this page. Everyone on the list hears first.
              </p>
              <Button
                onClick={copyLink}
                className="mt-4 h-11 rounded-full px-5 font-medium"
              >
                {copied ? "Copied" : "Copy page link"}
              </Button>
            </div>
          </section>
        ) : (
          <>
            <section className="mt-12 lg:mt-16">
              <h1 className="text-[40px] leading-[1.08] font-bold text-foreground lg:text-[56px]">
                Something feels off.
                <br />
                <span className="text-primary">Know how serious it is.</span>
              </h1>
              <p className="mt-4 text-[18px] leading-[1.6] text-muted-foreground lg:text-[20px]">
                 A concerning message.{"\u00a0"}
                 <br />
                 A confusing term they used at dinner.{"\u00a0"}
                 <br />
                 A joke they made with friends that made you nervous.
                 <br />
                 Find out how serious it is, and how to talk about it.
              </p>
            </section>

            <div className="mt-8 lg:mt-12">
              <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.14em] text-hint">
                OPENS OCTOBER 1ST, 2026
              </p>
              <Countdown />
            </div>

            <form
              onSubmit={submit}
              className="mt-6 flex flex-col gap-3 lg:mt-12 lg:gap-5 lg:rounded-[28px] lg:bg-card lg:border lg:border-border/80 lg:p-8"
              noValidate
            >
              <fieldset>
                <legend className="mb-2 text-[15px] font-medium text-foreground">
                  Which fits you? Pick one or many.
                </legend>
                <div className="grid gap-2 lg:grid-cols-2 lg:gap-3">
                  {ROLES.map((r) => {
                    const checked = roles.includes(r.value);
                    return (
                      <button
                        key={r.value}
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        onClick={() =>
                          setRoles((prev) =>
                            checked
                              ? prev.filter((v) => v !== r.value)
                              : [...prev, r.value],
                          )
                        }
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[16px] transition-colors ${
                          checked
                            ? "border-primary bg-primary/15 text-foreground"
                            : "border-border/80 bg-card text-muted-foreground"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                            checked
                              ? "border-primary bg-primary text-background"
                              : "border-border/80 bg-background"
                          }`}
                        >
                          {checked && (
                            <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
                              <path
                                d="M4 10.5 8.2 14.5 16 5.5"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-13 rounded-2xl border-border/80 bg-card px-4 text-[17px]"
                required
              />
              {error && <p className="text-[15px] text-destructive">{error}</p>}
              <Button
                type="submit"
                disabled={loading}
                className="h-13 rounded-2xl text-[17px] font-bold"
              >
                {loading ? "Saving…" : "Get early access"}
              </Button>
              <p className="text-center text-[15px] text-hint">
                 No spam. We'll email you only when it's ready.
              </p>
            </form>

            <div className="mt-10 grid gap-3 lg:mt-14 lg:grid-cols-2 lg:gap-4">
              <Tile
                className="lg:col-span-2"
                tag="Both worries"
                title="Getting hurt, or hurting someone"
                body="Someone may be pressuring your kid. Or your kid may be sharing something cruel or illegal without knowing it."
                icon={<ShieldAlert size={16} className="text-primary" />}
              />
              <Tile
                tag="What you get"
                title="How serious it is, and what to say"
                body="A plain read on how serious it is. The words to start the talk — and where to report if it's serious."
                icon={<Sparkles size={16} className="text-primary" />}
              />
              <Tile
                className="lg:col-span-2"
                tag="NO ULTERIOR MOTIVES"
                title="No surveillance or tracking"
                body="We help you understand what they see, hear, or say, and know how to respond. We're a nonprofit and never sell your data."
                icon={<Lock size={16} className="text-primary" />}
              />
            </div>

            <p className="mt-8 text-[14px] leading-[1.6] text-hint">
              If your child is in danger right now, call or text 988 (Suicide and Crisis Lifeline) or text HOME to 741741 (Crisis Text Line). We're not a crisis line. Please don't wait on us in an emergency.
            </p>
          </>
        )}
      </div>

      <footer className="relative border-t border-border/60 py-7">
        <div className="mx-auto flex max-w-lg items-center justify-between px-5 text-[15px] text-hint lg:max-w-3xl lg:px-10">
          <span>
            Made by{" "}
            <a
              href="https://overridelabsprevention.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary underline underline-offset-2 transition-colors"
            >
              Override Labs
            </a>
            , a 501(c)3 nonprofit.
            We also build{" "}
            <a
              href="https://isthisok.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary underline underline-offset-2 transition-colors"
            >
              isthisok.app
            </a>
            , a private self-reflection space for teens.
          </span>
          <Link to="/unlock" className="hover:text-primary transition-colors">
            {"\n"}
          </Link>
        </div>
      </footer>
    </div>
  );
}
