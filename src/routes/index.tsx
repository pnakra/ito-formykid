import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header, Footer, FeatureCard } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Shield, MessageCircle, Eye } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "is this ok? for parents — understand what your child sees online" },
      { name: "description", content: "A calm, warm orientation tool helping parents understand harmful online content their child may be consuming — and how to talk about it." },
      { property: "og:title", content: "is this ok? for parents" },
      { property: "og:description", content: "Understand what your child sees online. Get gentle guidance — not scripts — for meaningful conversations." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={!!user} />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-2xl px-5 text-center">
            <Badge variant="chip" className="mb-4">for parents</Badge>
            <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-4">
              is this ok?
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
              Understand what your child is seeing online. Get calm, clear orientation — not scripts — for how to respond.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to={user ? "/scan" : "/signup"}>
                <Button size="lg">
                  {user ? "Start a scan" : "Get started free"}
                </Button>
              </Link>
              {!user && (
                <Link to="/login">
                  <Button variant="outline" size="lg">Log in</Button>
                </Link>
              )}
            </div>
            <p className="mt-3 text-xs text-hint">
              3 free scans. Then $9/month.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="py-12 border-t">
          <div className="mx-auto max-w-2xl px-5">
            <p className="label-text mb-6 text-center">How it works</p>
            <div className="grid gap-4 md:grid-cols-3">
              <FeatureCard
                icon={Eye}
                title="Paste or describe"
                description="Share a link or describe the content your child encountered. URLs, app names, or just what you noticed."
              />
              <FeatureCard
                icon={Shield}
                title="Get a clear picture"
                description="Receive a calm, jargon-free assessment of what the content is and what risks it may carry."
              />
              <FeatureCard
                icon={MessageCircle}
                title="Know how to respond"
                description="Get gentle orientation for how to open a conversation with your teen — without surveillance or panic."
              />
            </div>
          </div>
        </section>

        {/* Example */}
        <section className="py-12 border-t">
          <div className="mx-auto max-w-2xl px-5">
            <p className="label-text mb-6 text-center">Example scan</p>
            <div className="rounded-[14px] border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="chip">tiktok.com/...</Badge>
                <Badge variant="concerning">Concerning</Badge>
              </div>
              <p className="text-[15px] text-foreground mb-3">
                This TikTok trend normalizes pressuring others into physical affection as a "joke." While framed as humor, it models boundary-crossing behavior that teens may internalize as acceptable.
              </p>
              <div className="rounded-[10px] bg-background border p-4">
                <p className="label-text mb-2">Orientation</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You might ask your teen if they've seen this trend and what they think about it. Rather than lecturing, express curiosity: "What would you do if someone did that to you?" This opens space for them to think critically about consent in everyday situations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tone */}
        <section className="py-12 border-t">
          <div className="mx-auto max-w-xl px-5 text-center">
            <h2 className="text-xl font-medium text-foreground mb-3">
              This is not a surveillance tool
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              is this ok? doesn't monitor your child's device. It's a resource for you — to understand what's out there, and to feel more confident in the conversations that matter most.
            </p>
            <p className="mt-6 text-sm text-hint">
              A companion to{" "}
              <a
                href="https://isthisok.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-4"
              >
                isthisok.app
              </a>
              , a consent education tool for teens.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
