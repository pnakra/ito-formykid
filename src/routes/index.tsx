import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, BookOpen, Shield, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "is this ok? for parents — understand what your child sees online" },
      { name: "description", content: "Two ways to protect your child online: understand something worrying right now, or stay ahead of harmful influence over time. For parents and grandparents." },
      { property: "og:title", content: "is this ok? for parents" },
      { property: "og:description", content: "Understand something worrying right now. Stay ahead of harmful online influence over time." },
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
              Two ways to keep your child safer online
            </h1>
            <p className="text-[15px] md:text-[16px] text-hint leading-relaxed mb-8">
              When something worries you, we help you understand it. When nothing's wrong yet, we help you stay ahead of it. No monitoring. No device access. Just a calmer way to stay connected.
            </p>

            {/* Two modes */}
            <div className="grid gap-4 md:grid-cols-2 mb-8">
              <div className="rounded-[14px] border bg-card p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent">
                  <Search className="h-4 w-4 text-foreground" />
                </div>
                <h2 className="text-[16px] font-medium text-foreground mb-2">Understand now</h2>
                <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">
                  You heard something, saw something, or just have a feeling. Type it in — a creator, a word, a game, a behavior — and get a plain-language report on what it is, why young people are drawn to it, and how to talk about it.
                </p>
                <Link to="/scan">
                  <Button size="sm" className="w-full">Look something up</Button>
                </Link>
              </div>

              <div className="rounded-[14px] border bg-card p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent">
                  <TrendingUp className="h-4 w-4 text-foreground" />
                </div>
                <h2 className="text-[16px] font-medium text-foreground mb-2">Stay ahead</h2>
                <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">
                  Don't wait for a crisis. Get a monthly briefing on what kids are seeing, track patterns in what you notice at home, and strengthen the factors that research shows protect young people.
                </p>
                <Link to="/signup">
                  <Button variant="outline" size="sm" className="w-full">Create a free account</Button>
                </Link>
              </div>
            </div>

            <p className="text-[12px] text-hint text-center">
              First lookup is free. $9/month after that — includes both modes.
            </p>
          </div>
        </section>

        {/* Moment cards */}
        <section className="py-12 border-t">
          <div className="mx-auto max-w-3xl px-5">
            <h2 className="text-xl font-medium text-foreground mb-6 text-center">
              Parents come to us in moments like these
            </h2>
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

        {/* How Understand Now works */}
        <section className="py-12 border-t">
          <div className="mx-auto max-w-xl px-5">
            <p className="label-text mb-2">UNDERSTAND NOW</p>
            <h2 className="text-xl font-medium text-foreground mb-6">
              How it works when something worries you
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
          </div>
        </section>

        {/* How Stay Ahead works */}
        <section className="py-12 border-t">
          <div className="mx-auto max-w-xl px-5">
            <p className="label-text mb-2">STAY AHEAD</p>
            <h2 className="text-xl font-medium text-foreground mb-6">
              How it works when nothing's wrong yet
            </h2>
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <BookOpen className="h-4 w-4 text-hint" />
                </div>
                <div>
                  <p className="text-[15px] font-medium text-foreground mb-1">Monthly briefing</p>
                  <p className="text-[14px] text-muted-foreground leading-relaxed">
                    A plain-language summary of what kids your child's age are seeing online right now — and what to watch for.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <MessageCircle className="h-4 w-4 text-hint" />
                </div>
                <div>
                  <p className="text-[15px] font-medium text-foreground mb-1">Situation log & pattern tracking</p>
                  <p className="text-[14px] text-muted-foreground leading-relaxed">
                    Write down what you notice — a comment, a mood shift, a new friend group. After a few entries, we surface patterns you might not see on your own.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <Shield className="h-4 w-4 text-hint" />
                </div>
                <div>
                  <p className="text-[15px] font-medium text-foreground mb-1">Protective factors check-in</p>
                  <p className="text-[14px] text-muted-foreground leading-relaxed">
                    Research shows five things reduce a young person's vulnerability to harmful online influence. We help you reflect on where your family stands — and offer practical, specific ideas for the areas that need attention.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-[14px] text-muted-foreground mt-6 leading-relaxed">
              We don't monitor your child's devices. We don't need access to their accounts. This is a companion for you — not surveillance software.
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
