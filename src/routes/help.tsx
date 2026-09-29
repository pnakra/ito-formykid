import { createFileRoute } from "@tanstack/react-router";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { HELP_PAGE_RESOURCES } from "@/content/safetyCopy";

const TITLE = "Get help — is this ok for my kid?";
const DESC = "Crisis lines and reporting services for kids and families in the US.";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isLoggedIn={!!user} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-12 pb-16">
        <h1 className="font-display text-[36px] font-bold leading-tight text-foreground">Get help</h1>
        <p className="mt-3 text-[18px] text-muted-foreground">
          If someone could be in danger right now, reach out to one of these.
        </p>
        <ul className="mt-8 space-y-4">
          {HELP_PAGE_RESOURCES.map((r) => (
            <li key={r.name} className="rounded-3xl border border-border/80 bg-card p-5">
              <h2 className="text-[19px] font-semibold text-foreground">{r.name}</h2>
              <p className="mt-1 text-[17px] text-muted-foreground">{r.what}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[17px]">
                {r.phone && (
                  <a href={`tel:${r.phone.tel}`} className="font-medium text-primary underline underline-offset-4">
                    {r.phone.label}
                  </a>
                )}
                {r.url && (
                  <a
                    href={r.url.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline underline-offset-4"
                  >
                    {r.url.label}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}
