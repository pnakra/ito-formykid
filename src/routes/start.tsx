import { grantStudyAccess } from "@/lib/earlyAccess.functions";
import { markUnlocked } from "@/lib/accessGate";
import { track } from "@/lib/track";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header, Footer } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  getConsent,
  isStudySource,
  markScreenerDone,
  markStudyNoticeSeen,
  normalizeSource,
  screenerDone,
  setConsent,
  storeEntry,
  studyNoticeSeen,
  studyVariant,
  type StudyVariant,
} from "@/lib/entrySource";
import { saveStudyAnswers } from "@/lib/studyAnswers";
import { ChoicePills, YES_NO } from "@/components/QuickQuestions";

const TITLE = "Get started — is this ok for my kid?";
const DESC =
  "Look up a phrase, creator, joke, or group-chat moment. Get context and help talking with your kid.";

const NOTICE_1 =
  "This study tests a tool that helps parents make sense of things they notice in their kids' online lives. Some scenarios involve pressure, harassment, and sexual images involving teenagers. Nothing is graphic. You can stop at any time. Please do not enter anything about your own child or any real person. Use only the scenarios we give you.";
const NOTICE_2 =
  "This study tests a tool that helps parents make sense of things they notice in their teenagers' online lives. You'll use it on 2 situations of your own: something you've seen, worried about, or heard about from other parents. Please leave out names, schools, usernames, and other identifying details. If something serious is happening right now, the tool will point you to help. You can stop at any time.";
const CONSENT_Q = "Can we save what you type into the tool, with no names, so we can improve it?";
const SCREENER_Q = "Are you a parent or guardian of a child aged 13 to 18?";

export const Route = createFileRoute("/start")({
  validateSearch: (s: Record<string, unknown>) => ({
    src: typeof s.src === "string" ? s.src : undefined,
    // Prolific may fill only one of pid / PROLIFIC_PID; take the first real (substituted) value.
    pid: (() => {
      const vals = [s.pid, s.PROLIFIC_PID].map((v) => (v == null ? "" : String(v).trim()));
      const real = vals.find((v) => v && !/[%{}]/.test(v));
      return real ?? (vals.find((v) => v) || undefined);
    })(),
  }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StartPage,
});

type Phase = "loading" | "notice" | "consent" | "screener" | "landing";

function nextPhase(): Phase {
  if (!studyVariant()) return "landing";
  if (!studyNoticeSeen()) return "notice";
  if (!getConsent()) return "consent";
  if (!screenerDone()) return "screener";
  return "landing";
}

function StartPage() {
  const { src, pid } = Route.useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();
  // Study links render nothing until the browser decides which step to show,
  // so nobody can click past the notice before the page is ready.
  const [phase, setPhase] = useState<Phase>(src ? "loading" : "landing");
  const [variant, setVariant] = useState<StudyVariant | null>(null);
  const [choice, setChoice] = useState("");
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const advance = () => {
    const p = nextPhase();
    setChoice("");
    setMissing(false);
    setSaveError(false);
    if (p === "landing" && studyVariant() === 2) {
      navigate({ to: "/scan", replace: true });
      return;
    }
    setPhase(p);
  };

  useEffect(() => {
    if (src) {
      const source = normalizeSource(src);
      storeEntry(source, pid);
      if (isStudySource(source)) {
        void grantStudyAccess().then(() => markUnlocked()).catch(() => {});
      }
    }
    setVariant(studyVariant());
    advance();
    track("start_viewed");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, pid]);

  const saveStep = async (key: "consent" | "screener") => {
    if (!choice) { setMissing(true); return; }
    setBusy(true);
    setSaveError(false);
    const ok =
      key === "consent"
        ? await saveStudyAnswers("consent", { save_typed_text: choice })
        : await saveStudyAnswers("screener", { parent_13_18: choice });
    setBusy(false);
    if (!ok) { setSaveError(true); return; }
    if (key === "consent") setConsent(choice as "yes" | "no");
    else markScreenerDone();
    advance();
  };

  const card = "rounded-3xl border border-border/80 bg-card p-6 lg:p-8";
  const btn = "mt-8 h-14 w-full rounded-full text-[18px] sm:w-auto sm:px-10";
  const errorLine = saveError && (
    <p role="alert" className="mt-4 text-[16px] text-error">That didn't save. Please tap Continue again.</p>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isLoggedIn={!!user} study={variant ? true : undefined} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-14 pb-16 lg:pt-20">
        {phase === "loading" ? null : phase === "notice" ? (
          <section className={card}>
            <p className="label-text mb-4 text-primary">BEFORE YOU START</p>
            <p className="text-[18px] leading-[1.6] text-foreground">{variant === 2 ? NOTICE_2 : NOTICE_1}</p>
            <Button size="lg" className={btn} onClick={() => { markStudyNoticeSeen(); advance(); }}>
              Continue
            </Button>
          </section>
        ) : phase === "consent" || phase === "screener" ? (
          <section className={card}>
            <p className="mb-4 text-[18px] font-medium leading-snug text-foreground">
              {phase === "consent" ? CONSENT_Q : SCREENER_Q}
            </p>
            <ChoicePills
              label={phase === "consent" ? CONSENT_Q : SCREENER_Q}
              value={choice}
              options={YES_NO}
              onChange={(v) => { setChoice(v); setMissing(false); }}
            />
            {missing && <p role="alert" className="mt-4 text-[16px] text-error">Please pick Yes or No.</p>}
            {errorLine}
            <Button size="lg" disabled={busy} className={btn} onClick={() => saveStep(phase)}>
              {busy ? "Saving…" : "Continue"}
            </Button>
          </section>
        ) : (
          <section>
            <h1 className="font-display text-[36px] font-bold leading-[1.1] tracking-tight text-foreground lg:text-[52px]">
              Understand the online moment. Know what to say next.
            </h1>
            <p className="mt-5 max-w-[62ch] text-[18px] leading-[1.6] text-muted-foreground">
              Look up a phrase, creator, joke, group-chat situation, or relationship dynamic. Get
              context, a proportionate next step, and help talking with your kid about respect,
              boundaries, and pressure.
            </p>
            {variant === 1 && (
              <Link to="/samples/$id" params={{ id: "joke" }} className="mt-10 block">
                <Button size="lg" className="h-16 w-full rounded-2xl text-[18px]">Start task 1</Button>
              </Link>
            )}
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Link to="/scan" className="block">
                <Button size="lg" className="h-16 w-full rounded-2xl text-[18px]">
                  Explore something I noticed
                </Button>
              </Link>
              <Link to="/samples" className="block">
                <Button size="lg" variant="outline" className="h-16 w-full rounded-2xl text-[18px]">
                  Try a sample situation
                </Button>
              </Link>
            </div>
            {!variant && !user && (
              <p className="mt-6 text-[15px] text-hint">
                No account needed. Sign in only if you want to save results.
              </p>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
