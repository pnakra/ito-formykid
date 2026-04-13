import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "is this ok? for parents — understand what your child sees online" },
      { name: "description", content: "Enter a creator, game, phrase, or behavior — get plain-language context on what it is, why it appeals to young people, and how to stay in the conversation." },
      { property: "og:title", content: "is this ok? for parents" },
      { property: "og:description", content: "Your kid is online. You deserve to understand what they're seeing." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
          <Link to="/" className="text-[13px] font-medium tracking-[0.06em] text-hint">
            is this ok? for parents
          </Link>
          <Link to="/login" className="text-[13px] text-hint hover:text-foreground transition-colors">
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-2xl px-5">
            <h1 className="text-2xl md:text-3xl font-medium text-foreground leading-[1.35] mb-4">
              Stay ahead of what your child is seeing online.
            </h1>
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
              Decode troubling content and behavior shifts. Understand why it resonates. Know what to ask, what to watch for, and what actually helps. For parents of adolescents 11–18.
            </p>
            <Link to="/scan">
              <Button size="lg">Try it free</Button>
            </Link>
            <p className="mt-3 text-xs text-hint">
              First scan free. $9/month after that.
            </p>
          </div>
        </section>

        {/* Value prop cards */}
        <section className="py-12 border-t">
          <div className="mx-auto max-w-3xl px-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[14px] border bg-card p-5">
                <p className="label-text mb-2">DECODE IT</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Plain-language breakdowns of creators, games, communities, and language — with pipeline context and transparent reasoning.
                </p>
              </div>
              <div className="rounded-[14px] border bg-card p-5">
                <p className="label-text mb-2">UNDERSTAND THE PULL</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every harmful content pipeline works because it meets a real need. Understanding why your child is drawn to something is what makes conversation possible.
                </p>
              </div>
              <div className="rounded-[14px] border bg-card p-5">
                <p className="label-text mb-2">STAY AHEAD</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Monthly briefings, situation logging, and protective factor guidance — so you're not just reacting to crises.
                </p>
              </div>
              <div className="rounded-[14px] border bg-card p-5">
                <p className="label-text mb-2">KNOW WHAT HELPS</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The research on what reduces adolescent vulnerability to harmful online influence — translated into things you can actually do.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pattern section */}
        <section className="py-12 border-t">
          <div className="mx-auto max-w-xl px-5">
            <h2 className="text-xl font-medium text-foreground mb-3">
              Built for the full range of harmful online influence.
            </h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed">
              is this ok? covers gender-based attitudes and masculinity culture, body image and eating disorder content, sexual coercion and consent myths, identity suppression and anti-LGBTQ+ pipelines, grooming-adjacent communities, and harmful gaming culture. The common thread: content that shapes how young people think about themselves, relationships, and other people — before parents realize it's happening.
            </p>
          </div>
        </section>

        {/* Retention hook */}
        <section className="py-12 border-t">
          <div className="mx-auto max-w-xl px-5">
            <h2 className="text-xl font-medium text-foreground mb-3">
              Stay oriented, not just reactive.
            </h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-6">
              Subscribers receive a monthly digest — what's trending in your child's age group, new communities to know about, and signals other parents are noticing. Because harmful content evolves faster than any single search.
            </p>
            {/* Mock email preview */}
            <div className="rounded-[14px] border bg-card p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-medium tracking-[0.06em] uppercase text-hint">is this ok?</span>
                <span className="text-[11px] text-hint">·</span>
                <span className="text-[11px] text-hint">Monthly digest</span>
              </div>
              <p className="text-[15px] font-medium text-foreground mb-3">
                What parents of 13-year-olds are noticing this month →
              </p>
              <div className="space-y-2">
                <p className="text-sm text-hint leading-relaxed">
                  • A new Discord community gaining traction in middle schools — what it is and what to watch for
                </p>
                <p className="text-sm text-hint leading-relaxed">
                  • Why "just block it" doesn't work — and what parents are trying instead
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & safety */}
        <section className="py-12 border-t">
          <div className="mx-auto max-w-xl px-5 text-center">
            <p className="text-[13px] text-hint leading-relaxed">
              Our classifications are based on documented research into online radicalization and harm pipelines. We show confidence levels and reasoning for every result. We don't diagnose creators — we give parents context. is this ok? is not affiliated with any platform, creator, or advertiser.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-xl px-5 text-center">
          <p className="text-[13px] text-hint leading-relaxed">
            is this ok? for parents is a product of Override Labs, an Illinois nonprofit building prevention technology for young people and the adults in their lives. We are not a monitoring tool. We do not access your child's devices or accounts.
          </p>
        </div>
      </footer>
    </div>
  );
}
