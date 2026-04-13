import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "is this ok? for parents — understand what your child sees online" },
      { name: "description", content: "Something doesn't feel right about what your child is seeing online. Type in a name, a word, or a behavior — and we'll help you understand what's going on." },
      { property: "og:title", content: "is this ok? for parents" },
      { property: "og:description", content: "Something doesn't feel right. We can help you figure out what's going on." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const [digestEmail, setDigestEmail] = useState("");
  const [digestSubmitted, setDigestSubmitted] = useState(false);

  const handleDigestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (digestEmail.trim()) {
      setDigestSubmitted(true);
    }
  };

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
        <section className="py-12 md:py-24">
          <div className="mx-auto max-w-2xl px-5">
            <h1 className="text-[24px] md:text-[32px] font-medium text-foreground leading-[1.35] mb-4">
              Something doesn't feel right. We can help you figure out what's going on.
            </h1>
            <p className="text-[15px] md:text-[16px] text-hint leading-relaxed mb-7">
              Parents and grandparents use is this ok? when they hear something from a child that worries them — a word, a name, a video, a change in how they're acting. Type it in and we'll tell you what it is, why young people are drawn to it, and how to talk about it without pushing them away.
            </p>
            <Link to="/scan">
              <Button size="lg" className="w-full sm:w-auto">Try it free — no account needed</Button>
            </Link>
            <p className="mt-3 text-[12px] text-hint">
              First look is free. $9/month after that.
            </p>
          </div>
        </section>

        {/* Moment cards */}
        <section className="py-12 border-t">
          <div className="mx-auto max-w-3xl px-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[14px] bg-card p-5">
                <p className="text-[15px] text-foreground leading-relaxed">
                  Your son said something about women that stopped you cold. You don't know where he learned it — but it didn't sound like him.
                </p>
              </div>
              <div className="rounded-[14px] bg-card p-5">
                <p className="text-[15px] text-foreground leading-relaxed">
                  Your daughter started skipping meals and following accounts full of before-and-after photos. You're not sure what you're looking at.
                </p>
              </div>
              <div className="rounded-[14px] bg-card p-5">
                <p className="text-[15px] text-foreground leading-relaxed">
                  Your grandchild uses words online you've never heard. When you ask, they brush you off. You just have a feeling something is off.
                </p>
              </div>
            </div>
            <p className="text-center text-[13px] text-hint mt-6 leading-relaxed">
              You don't need to know the right words for what you're seeing. Just describe it and we'll help you make sense of it.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="py-12 border-t">
          <div className="mx-auto max-w-xl px-5">
            <h2 className="text-xl font-medium text-foreground mb-6">
              Here's how it works
            </h2>
            <div className="space-y-5">
              <div className="flex gap-4">
                <span className="text-[15px] font-medium text-hint shrink-0 mt-0.5">1.</span>
                <p className="text-[15px] text-foreground leading-relaxed">
                  Tell us what you noticed — a name, a word, a video, a change in behavior. Whatever it is.
                </p>
              </div>
              <div className="flex gap-4">
                <span className="text-[15px] font-medium text-hint shrink-0 mt-0.5">2.</span>
                <p className="text-[15px] text-foreground leading-relaxed">
                  We explain what it is, where it comes from, and why young people are drawn to it — in plain language.
                </p>
              </div>
              <div className="flex gap-4">
                <span className="text-[15px] font-medium text-hint shrink-0 mt-0.5">3.</span>
                <p className="text-[15px] text-foreground leading-relaxed">
                  We tell you what tends to backfire when parents respond, and give you one simple way to open the conversation.
                </p>
              </div>
            </div>
            <p className="text-[14px] text-muted-foreground mt-6 leading-relaxed">
              We don't monitor your child's devices. We don't need access to their accounts. You just tell us what you saw or heard.
            </p>
          </div>
        </section>

        {/* What we cover */}
        <section className="py-12 border-t">
          <div className="mx-auto max-w-xl px-5">
            <h2 className="text-xl font-medium text-foreground mb-4">
              What kinds of things can you look up?
            </h2>
            <p className="text-[15px] text-foreground leading-relaxed">
              Things that teach boys that being kind or emotional makes them less of a man. Content that tells girls their only value is how they look. Online communities that seem designed to pull young people away from the adults who love them. Videos or accounts promoting extreme dieting or dangerous ideas about food and bodies. Content that targets kids who are gay, trans, or figuring out who they are. Games or online spaces where adults may be trying to get too close to children.
            </p>
            <p className="text-[13px] text-hint mt-4 leading-relaxed">
              If you're not sure whether what you've seen falls into any of these — type it in anyway. We'll tell you what we know.
            </p>
          </div>
        </section>

        {/* Trust */}
        <section className="py-12 border-t">
          <div className="mx-auto max-w-xl px-5">
            <h2 className="text-xl font-medium text-foreground mb-6">
              A few things worth knowing
            </h2>
            <div className="space-y-5">
              <p className="text-[15px] text-foreground leading-relaxed">
                We're not going to tell you your child is broken or that you've already failed. We're going to help you understand what they're seeing and give you a way in.
              </p>
              <p className="text-[15px] text-foreground leading-relaxed">
                We don't pretend to have all the answers. Every result shows you how confident we are and why — so you can decide what to do with the information.
              </p>
              <p className="text-[15px] text-foreground leading-relaxed">
                We're a nonprofit. We don't have advertisers. We don't have an agenda except helping families stay connected.
              </p>
            </div>
          </div>
        </section>

        {/* Monthly digest */}
        <section className="py-12 border-t">
          <div className="mx-auto max-w-xl px-5">
            <h2 className="text-xl font-medium text-foreground mb-3">
              Want to stay ahead of it?
            </h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-6">
              Once a month, we send a plain-language email to parents and grandparents about what young people in your child's age group are seeing online right now — and what you can do about it. It's free.
            </p>

            {digestSubmitted ? (
              <div className="rounded-[14px] bg-card p-5 text-center">
                <p className="text-[15px] text-foreground">You're signed up. We'll be in touch.</p>
              </div>
            ) : (
              <form onSubmit={handleDigestSubmit} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  value={digestEmail}
                  onChange={(e) => setDigestEmail(e.target.value)}
                  placeholder="your email address"
                  required
                  className="flex-1"
                />
                <Button type="submit" className="w-full sm:w-auto whitespace-nowrap">Send me the monthly update</Button>
              </form>
            )}

            <p className="text-[12px] text-hint mt-3">
              No spam. One email a month. Unsubscribe anytime.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-xl px-5 text-center">
          <p className="text-[13px] text-hint leading-relaxed">
            is this ok? for parents is made by Override Labs, a nonprofit working to keep young people safer online and in their relationships. We don't access your child's devices or accounts. We are not affiliated with any social media platform, creator, or advertiser.
          </p>
        </div>
      </footer>
    </div>
  );
}
