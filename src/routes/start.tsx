import { grantStudyAccess } from "@/lib/earlyAccess.functions";
import { markUnlocked } from "@/lib/accessGate";
import { track } from "@/lib/track";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header, Footer } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  markStudyNoticeSeen,
  normalizeSource,
  storeEntry,
  studyNoticeSeen,
} from "@/lib/entrySource";
import { saveStudyAnswers } from "@/lib/studyAnswers";
import { ChoicePills, YES_NO } from "@/components/QuickQuestions";

const TITLE = "Get started — is this ok for my kid?";
const DESC =
  "Look up a phrase, creator, joke, or group-chat moment. Get context and help talking with your kid.";

export const Route = createFileRoute("/start")({
  validateSearch: (s: Record<string, unknown>) => ({
    src: typeof s.src === "string" ? s.src : undefined,
    pid: typeof s.pid === "string" ? s.pid : undefined,
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

function StartPage() {
  const { src, pid } = Route.useSearch();
  const { user } = useAuth();
  const [isStudy, setIsStudy] = useState(src === "prolific");
  const [showNotice, setShowNotice] = useState(false);
  const [showScreener, setShowScreener] = useState(false);
  const [screener, setScreener] = useState("");
  const [screenerMissing, setScreenerMissing] = useState(false);
  const [screenerBusy, setScreenerBusy] = useState(false);

  useEffect(() => {
    if (src) {
      const source = normalizeSource(src);
      storeEntry(source, pid);
      setIsStudy(source === "prolific");
      if (source === "prolific") {
        // Make sure this browser keeps study access (cookie) for the session.
        void grantStudyAccess().then(() => markUnlocked()).catch(() => {});
        if (!studyNoticeSeen()) setShowNotice(true);
      }
    } else {
      setIsStudy(sessionStorage.getItem("itok_src") === "prolific");
    }
    track("start_viewed");
  }, [src, pid]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isLoggedIn={!!user} study={isStudy} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-14 pb-16 lg:pt-20">
        {showNotice ? (
          <section className="rounded-3xl border border-border/80 bg-card p-6 lg:p-8">
            <p className="label-text mb-4 text-primary">BEFORE YOU START</p>
            <p className="text-[18px] leading-[1.6] text-foreground">
              This study tests a tool that helps parents make sense of things they notice in their
              kids' online lives. Some scenarios involve pressure, harassment, and sexual images
              involving teenagers. Nothing is graphic. You can stop at any time. Please do not enter
              anything about your own child or any real person. Use only the scenarios we give you.
            </p>
            <Button
              size="lg"
              className="mt-8 h-14 w-full rounded-full text-[18px] sm:w-auto sm:px-10"
              onClick={() => {
                markStudyNoticeSeen();
                setShowNotice(false);
                setShowScreener(true);
              }}
            >
              Continue
            </Button>
          </section>
        ) : showScreener ? (
          <section className="rounded-3xl border border-border/80 bg-card p-6 lg:p-8">
            <p className="mb-4 text-[18px] font-medium leading-snug text-foreground">
              Are you a parent or guardian of a child aged 13 to 18?
            </p>
            <ChoicePills label="Are you a parent or guardian of a child aged 13 to 18?" value={screener} options={YES_NO} onChange={(v) => { setScreener(v); setScreenerMissing(false); }} />
            {screenerMissing && <p role="alert" className="mt-4 text-[16px] text-error">Please pick Yes or No.</p>}
            <Button
              size="lg"
              disabled={screenerBusy}
              className="mt-8 h-14 w-full rounded-full text-[18px] sm:w-auto sm:px-10"
              onClick={async () => {
                if (!screener) { setScreenerMissing(true); return; }
                setScreenerBusy(true);
                await saveStudyAnswers("screener", { parent_13_18: screener });
                setScreenerBusy(false);
                setShowScreener(false);
              }}
            >
              Continue
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
            {!isStudy && !user && (
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
