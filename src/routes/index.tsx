import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "is this ok? — understand what your child sees online" },
      { name: "description", content: "A nonprofit orientation tool for parents and grandparents. Understand something worrying right now, or stay ahead of harmful online influence over time." },
      { property: "og:title", content: "is this ok? for my kid" },
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
      {/* Header — minimal, institutional */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
          <Link to="/" className="text-[13px] font-medium tracking-[0.06em] text-hint">
            is this ok? for my kid
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-[13px] text-hint hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link to="/signup" className="text-[13px] text-foreground hover:text-foreground/80 transition-colors font-medium">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ═══ Hero ═══ */}
        <section className="pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="mx-auto max-w-2xl px-5">
            <h1
              className="text-[28px] md:text-[38px] leading-[1.25] mb-6 text-foreground"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
            >
              The internet your kids see is not the one you know.
            </h1>
            <p className="text-[16px] md:text-[17px] text-muted-foreground leading-[1.7] mb-10 max-w-lg">
              You don't need to know the right words. Describe what you noticed — a comment, a shift in attitude, a word you didn't recognize, a change in how they're acting — and we'll help you make sense of it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/scan">
                <Button size="lg" className="text-[14px] px-6">Describe what you noticed</Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" size="lg" className="text-[14px] px-6">Create a free account</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ What this is — editorial statement ═══ */}
        <section className="py-16 md:py-20 bg-card">
          <div className="mx-auto max-w-2xl px-5">
            <p
              className="text-[18px] md:text-[20px] text-foreground leading-[1.65]"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
            >
              We're a nonprofit tool that helps parents and grandparents make sense of what young people encounter online — without monitoring their devices, accessing their accounts, or pretending to have all the answers.
            </p>
          </div>
        </section>

        {/* ═══ Moments — editorial case snapshots ═══ */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-2xl px-5">
            <p className="label-text mb-8">PARENTS COME TO US IN MOMENTS LIKE THESE</p>

            <div className="space-y-6">
              <div className="border-l-[3px] border-border pl-5">
                <p className="text-[15px] text-foreground leading-[1.7]">
                  Your son said something about women that stopped you cold. You don't know where he learned it — but it didn't sound like him.
                </p>
              </div>
              <div className="border-l-[3px] border-border pl-5">
                <p className="text-[15px] text-foreground leading-[1.7]">
                  Your daughter started skipping meals and following accounts full of before-and-after photos. You're not sure what you're looking at.
                </p>
              </div>
              <div className="border-l-[3px] border-border pl-5">
                <p className="text-[15px] text-foreground leading-[1.7]">
                  Your grandchild uses words online you've never heard. When you ask, they brush you off. You just have a feeling something is off.
                </p>
              </div>
              <div className="border-l-[3px] border-border pl-5">
                <p className="text-[15px] text-foreground leading-[1.7]">
                  Your son came home from school and told you he doesn't have to listen to his female teacher. When you pushed back, he just shrugged.
                </p>
              </div>
            </div>

            <p className="text-[14px] text-hint mt-8 leading-relaxed">
              These are the moments that bring parents here. Not a creator name — a feeling. You can start with that.
            </p>
          </div>
        </section>

        {/* ═══ Two modes — editorial, not cards ═══ */}
        <section className="py-16 md:py-20 bg-card">
          <div className="mx-auto max-w-2xl px-5">

            {/* Understand now */}
            <div className="mb-16">
              <p className="label-text mb-3">UNDERSTAND NOW</p>
              <h2
                className="text-[22px] md:text-[26px] text-foreground leading-[1.3] mb-5"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
              >
                When something worries you
              </h2>
              <div className="space-y-4 mb-6">
                <p className="text-[15px] text-foreground leading-[1.7]">
                  Type in a creator, a slang term, a game, a behavior — whatever brought you here. We give you a plain-language briefing: what it is, where it comes from, why young people are drawn to it, what to watch for, what tends to backfire, and one way to start the conversation.
                </p>
                <p className="text-[15px] text-foreground leading-[1.7]">
                  Every report shows you how confident we are in the result and why — so you can decide what to do with the information.
                </p>
              </div>
              <Link to="/scan">
                <Button size="default" className="text-[14px]">Look something up</Button>
              </Link>
            </div>

            <div className="border-t border-border" />

            {/* Stay ahead */}
            <div className="mt-16">
              <p className="label-text mb-3">STAY AHEAD</p>
              <h2
                className="text-[22px] md:text-[26px] text-foreground leading-[1.3] mb-5"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
              >
                When nothing's wrong yet
              </h2>
              <div className="space-y-6 mb-6">
                <div>
                  <p className="text-[15px] font-medium text-foreground mb-1">Monthly briefing</p>
                  <p className="text-[15px] text-muted-foreground leading-[1.7]">
                    A plain-language summary of what kids your child's age are seeing right now — and what to watch for. Sent once a month.
                  </p>
                </div>
                <div>
                  <p className="text-[15px] font-medium text-foreground mb-1">Situation log</p>
                  <p className="text-[15px] text-muted-foreground leading-[1.7]">
                    Write down what you notice — a comment, a mood shift, a new friend group. After a few entries, we help you see patterns you might not notice on your own.
                  </p>
                </div>
                <div>
                  <p className="text-[15px] font-medium text-foreground mb-1">Protective factors</p>
                  <p className="text-[15px] text-muted-foreground leading-[1.7]">
                    Research identifies five things that reduce a young person's vulnerability to harmful influence. We help you reflect on where your family stands and offer practical ideas for the areas that need attention.
                  </p>
                </div>
              </div>
              <Link to="/signup">
                <Button variant="outline" size="default" className="text-[14px]">Create a free account</Button>
              </Link>
            </div>

          </div>
        </section>

        {/* ═══ Trust — elevated, not small print ═══ */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-2xl px-5">
            <p className="label-text mb-8">HOW WE'RE DIFFERENT</p>

            <div className="space-y-8">
              <div>
                <h3
                  className="text-[18px] text-foreground mb-2"
                  style={{ fontFamily: "var(--font-serif)", fontWeight: 500 }}
                >
                  We are not a monitoring tool
                </h3>
                <p className="text-[15px] text-muted-foreground leading-[1.7]">
                  We don't access your child's devices, accounts, or messages. Everything in this tool comes from what you choose to share — a word, a name, a concern. That's it.
                </p>
              </div>

              <div className="border-t border-border" />

              <div>
                <h3
                  className="text-[18px] text-foreground mb-2"
                  style={{ fontFamily: "var(--font-serif)", fontWeight: 500 }}
                >
                  We show our confidence and reasoning
                </h3>
                <p className="text-[15px] text-muted-foreground leading-[1.7]">
                  Every result tells you how certain we are and why. When we're not sure, we say so. When a term could mean multiple things, we ask you to clarify. We'd rather be honest about uncertainty than pretend to know more than we do.
                </p>
              </div>

              <div className="border-t border-border" />

              <div>
                <h3
                  className="text-[18px] text-foreground mb-2"
                  style={{ fontFamily: "var(--font-serif)", fontWeight: 500 }}
                >
                  We're a nonprofit
                </h3>
                <p className="text-[15px] text-muted-foreground leading-[1.7]">
                  We don't have advertisers. We don't sell data. We're not affiliated with any platform, creator, or content company. We exist to help families stay connected through the hardest parts of growing up online.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ What we cover ═══ */}
        <section className="py-16 md:py-20 bg-card">
          <div className="mx-auto max-w-2xl px-5">
            <p className="label-text mb-3">WHAT YOU CAN LOOK UP</p>
            <p className="text-[15px] text-foreground leading-[1.75] mb-4">
              Things that teach boys that being kind or emotional makes them less of a man. Content that tells girls their only value is how they look. Online communities designed to pull young people away from the adults who love them. Videos promoting extreme dieting or dangerous ideas about food and bodies. Content that targets kids who are gay, trans, or figuring out who they are. Games or online spaces where adults may be trying to get too close to children.
            </p>
            <p className="text-[14px] text-hint leading-relaxed">
              If you're not sure whether what you've seen fits — type it in anyway. We'll tell you what we know, or we'll tell you we don't know yet.
            </p>
          </div>
        </section>

        {/* ═══ Monthly digest — editorial, not a form drop-in ═══ */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-2xl px-5">
            <p className="label-text mb-3">THE MONTHLY DIGEST</p>
            <h2
              className="text-[22px] md:text-[26px] text-foreground leading-[1.3] mb-4"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
            >
              Stay informed without doomscrolling
            </h2>
            <p className="text-[15px] text-muted-foreground leading-[1.7] mb-8">
              Once a month, we send a plain-language email about what young people in your child's age group are encountering online — trends worth knowing about, communities gaining traction, and what other parents are noticing. Written for busy adults. Free for everyone.
            </p>

            {digestSubmitted ? (
              <div className="border-l-[3px] border-primary pl-5 py-2">
                <p className="text-[15px] text-foreground">You're signed up. We'll be in touch.</p>
              </div>
            ) : (
              <form onSubmit={handleDigestSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <Input
                  type="email"
                  value={digestEmail}
                  onChange={(e) => setDigestEmail(e.target.value)}
                  placeholder="your email address"
                  required
                  className="flex-1"
                />
                <Button type="submit" className="whitespace-nowrap text-[14px]">Subscribe</Button>
              </form>
            )}

            <p className="text-[12px] text-hint mt-3">
              One email a month. No spam. Unsubscribe anytime.
            </p>
          </div>
        </section>

        {/* ═══ Pricing — honest, secondary ═══ */}
        <section className="py-16 md:py-20 bg-card">
          <div className="mx-auto max-w-2xl px-5">
            <p className="label-text mb-3">PRICING</p>
            <div className="space-y-4">
              <div>
                <p className="text-[15px] text-foreground leading-[1.7]">
                  <span className="font-medium">Free:</span> Your first lookups, the monthly digest, and enough to understand whether this tool is useful for your family.
                </p>
              </div>
              <div>
                <p className="text-[15px] text-foreground leading-[1.7]">
                  <span className="font-medium">$9/month:</span> Saved reports, situation tracking, pattern summaries, monthly briefings, protective factors guidance, and ongoing support as a parent companion — not just a lookup tool.
                </p>
              </div>
            </div>
            <p className="text-[14px] text-hint mt-6 leading-relaxed">
              We're a nonprofit. This price covers operating costs. There is no premium tier, no upsell, and no data monetization.
            </p>
          </div>
        </section>

      </main>

      {/* ═══ Footer ═══ */}
      <footer className="border-t py-10 md:py-14">
        <div className="mx-auto max-w-2xl px-5">
          <p className="text-[13px] font-medium text-foreground mb-3">is this ok? for my kid</p>
          <p className="text-[13px] text-hint leading-[1.75] mb-4">
            Made by Override Labs, a nonprofit working to keep young people safer online and in their relationships. We don't access your child's devices or accounts. We are not affiliated with any social media platform, creator, or advertiser.
          </p>
          <div className="flex gap-4 text-[13px]">
            <Link to="/login" className="text-hint hover:text-foreground transition-colors">Sign in</Link>
            <a href="https://isthisok.app" target="_blank" rel="noopener noreferrer" className="text-hint hover:text-foreground transition-colors">isthisok.app</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
