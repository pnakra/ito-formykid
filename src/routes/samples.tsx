import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const TITLE = "Sample situations — is this ok for my kid?";
const DESC = "Try the tool with a sample situation.";

export const Route = createFileRoute("/samples")({
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
        <h1 className="font-display text-[32px] font-bold leading-tight text-foreground">
          Sample situations
        </h1>
        <p className="mt-4 text-[18px] text-muted-foreground">Samples are coming soon.</p>
        <Link to="/scan" className="mt-8 inline-block">
          <Button size="lg" className="h-14 rounded-full px-8 text-[18px]">
            Explore something I noticed
          </Button>
        </Link>
      </main>
      <Footer />
    </div>
  );
}
