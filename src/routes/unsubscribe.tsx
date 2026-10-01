import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { unsubscribeDinner } from "@/lib/dinner.functions";

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: (s: Record<string, unknown>) => ({ token: typeof s.token === "string" ? s.token : undefined }),
  head: () => ({ meta: [
    { title: "Unsubscribe — is this ok for my kid?" },
    { name: "description", content: "Stop the weekly dinner-table question email." },
    { property: "og:title", content: "Unsubscribe — is this ok for my kid?" },
    { property: "og:description", content: "Stop the weekly dinner-table question email." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { token } = Route.useSearch();
  const { user } = useAuth();
  const unsub = useServerFn(unsubscribeDinner);
  const [state, setState] = useState<"working" | "done" | "error">("working");

  useEffect(() => {
    if (!token) { setState("error"); return; }
    unsub({ data: { token } }).then((r) => setState(r.ok ? "done" : "error")).catch(() => setState("error"));
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isLoggedIn={!!user} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-16">
        <h1 className="font-display text-[32px] font-bold text-foreground">Weekly question email</h1>
        <p role="status" className="mt-5 text-[18px] text-muted-foreground">
          {state === "working" ? "One moment…" : state === "done" ? "You're unsubscribed. You won't get any more weekly questions." : "That link didn't work. Please use the link from your most recent email."}
        </p>
      </main>
      <Footer />
    </div>
  );
}
