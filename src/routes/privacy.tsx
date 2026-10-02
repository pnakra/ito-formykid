import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";

const TITLE = "Privacy — is this ok for my kid?";
const DESC = "What happens to what you type, what we keep, and what we never keep.";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [
    { title: TITLE },
    { name: "description", content: DESC },
    { property: "og:title", content: TITLE },
    { property: "og:description", content: DESC },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: PrivacyPage,
});

const SECTIONS: { h: string; p: string[] }[] = [
  { h: "What happens to what you type", p: [
    "To write your answer, what you type is sent to AI models from OpenAI and Google, through Lovable's AI service. Those companies handle it under their own terms.",
    "Please leave out names, schools, usernames, and other details that could identify your child or anyone else.",
  ] },
  { h: "What we keep", p: [
    "Checks you don't save are not stored by us.",
    "If you sign in and save something, only you can see it. You can delete each saved item, or your whole account, at any time.",
  ] },
  { h: "Anonymous usage counts", p: [
    "We count which pages were used and which kind of answer appeared, so we can tell what helps. These counts never include anything you typed.",
  ] },
  { h: "Research studies", p: [
    "People taking part in our research studies who agreed to it have their typed text saved for research, without names.",
  ] },
  { h: "Weekly question email", p: [
    "If you sign up for the weekly question, we keep your email and the age group you picked. Every email has a link to unsubscribe.",
  ] },
  { h: "Not an emergency service", p: [
    "This tool can't send help. If someone is in danger right now, call 911.",
  ] },
  { h: "Contact", p: ["Questions about privacy? Email priya@overridelabsprevention.org."] },,
];

function PrivacyPage() {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isLoggedIn={!!user} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-14">
        <h1 className="font-display text-[36px] font-bold leading-tight text-foreground">Privacy</h1>
        <p className="mt-4 text-[18px] text-muted-foreground">In plain words: what happens to what you type, and what we keep.</p>
        {SECTIONS.map((s) => (
          <section key={s.h} className="mt-10">
            <h2 className="font-display text-[22px] font-semibold text-foreground">{s.h}</h2>
            {s.p.map((t) => <p key={t} className="mt-3 text-[18px] leading-[1.6] text-foreground">{t}</p>)}
          </section>
        ))}
        <p className="mt-12 text-[18px] text-muted-foreground">
          Need help now? <Link to="/help" className="underline underline-offset-4 hover:text-foreground">See where to get help</Link>.
        </p>
      </main>
      <Footer />
    </div>
  );
}
