import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { SAMPLES } from "@/content/samples";

const TITLE = "Sample situations — is this ok for my kid?";
const DESC = "Practice with three made-up situations and see what the tool says.";

export const Route = createFileRoute("/samples/")({
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
  component: SamplesPage,
});

function SamplesPage() {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isLoggedIn={!!user} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-14 pb-16">
        <h1 className="font-display text-[32px] font-bold leading-tight text-foreground">Sample situations</h1>
        <p className="mt-3 text-[18px] text-muted-foreground">Made up for practice.</p>
        <ul className="mt-8 space-y-4">
          {SAMPLES.map((s) => (
            <li key={s.id} className="rounded-2xl border border-border/80 bg-card p-5">
              <p className="text-[18px] leading-[1.55] text-foreground">"{s.scenario}"</p>
              <Link to="/samples/$id" params={{ id: s.id }} className="mt-4 inline-block">
                <Button>See the result</Button>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}
