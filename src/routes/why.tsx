import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Header, Footer } from "@/components/Layout";

export const Route = createFileRoute("/why")({
  head: () => ({
    meta: [
      { title: "Why this exists — is this ok?" },
      {
        name: "description",
        content:
          "Parents are worried about what their kids see online. This is why we built a calm place to ask, is this okay for my kid?",
      },
      {
        property: "og:title",
        content: "Why this exists — is this ok?",
      },
      {
        property: "og:description",
        content:
          "Parents are worried about what their kids see online. This is why we built a calm place to ask, is this okay for my kid?",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WhyPage,
});

const STATS = [
  {
    value: "75%",
    label: "of UK parents worry about what children see, hear, or do online",
  },
  {
    value: "13%",
    label:
      "say they are not confident they know what their children are seeing or hearing online",
  },
  {
    value: "67%",
    label: "are concerned about online content exposure overall",
  },
  {
    value: "74%",
    label: "of parents with 8–11 year olds are concerned about online content exposure",
  },
];

function WhyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isLoggedIn={false} />

      <main className="flex-1">
        {/* Hero */}
        <section className="pt-10 pb-14 md:pt-14">
          <div className="mx-auto max-w-2xl px-5">
            <h1
              className="text-[26px] md:text-[34px] leading-[1.25] mb-4 text-foreground"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
            >
              Why this exists
            </h1>
            <p className="text-[18px] text-muted-foreground leading-[1.6]">
              Parents are trying to keep up with what their kids see online. But it is hard to know what is normal, what is risky, and what deserves a conversation.
            </p>
          </div>
        </section>

        {/* The gap */}
        <section className="py-14 md:py-16 bg-card">
          <div className="mx-auto max-w-2xl px-5">
            <p className="label-text mb-6">THE GAP</p>
            <p className="text-[18px] text-foreground leading-[1.7] mb-6">
              Most parents are already using tools to monitor or restrict what their children do online. Yet many still do not feel confident they know what their child is actually seeing.
            </p>
            <p className="text-[18px] text-foreground leading-[1.7]">
              That gap between concern and confidence is the problem. It is not exposure alone — it is interpretation.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-14 md:py-16">
          <div className="mx-auto max-w-2xl px-5">
            <p className="label-text mb-6">WHAT THE NUMBERS SAY</p>
            <div className="space-y-6">
              {STATS.map((stat) => (
                <div key={stat.value} className="flex items-baseline gap-4">
                  <span
                    className="text-[34px] md:text-[42px] leading-none text-foreground shrink-0"
                    style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
                  >
                    {stat.value}
                  </span>
                  <p className="text-[18px] text-foreground leading-[1.6]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-[15px] text-hint">
              Sources: Ipsos 2025 UK survey; Children’s Commissioner for England.
            </p>
          </div>
        </section>

        {/* What this is for */}
        <section className="py-14 md:py-16 bg-card">
          <div className="mx-auto max-w-2xl px-5">
            <p className="label-text mb-6">WHAT THIS IS FOR</p>
            <p className="text-[18px] text-foreground leading-[1.7] mb-6">
              This is a calm place to ask, “Is this okay for my kid?” and get guidance you can actually use.
            </p>
            <p className="text-[18px] text-foreground leading-[1.7] mb-8">
              We translate the language, behavior, and influencers your child encounters into something you can talk about — with no monitoring and no judgment.
            </p>
            <Link to="/">
              <Button size="lg" className="text-[17px] px-6">
                Try it
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
