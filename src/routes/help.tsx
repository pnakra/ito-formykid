import { createFileRoute } from "@tanstack/react-router";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";

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

type Resource = {
  name: string;
  what: string;
  phone?: { label: string; href: string };
  link?: { label: string; href: string };
};

const RESOURCES: Resource[] = [
  { name: "911", what: "If someone is in immediate danger.", phone: { label: "Call 911", href: "tel:911" } },
  {
    name: "988 Suicide and Crisis Lifeline",
    what: "Call or text 988, any time.",
    phone: { label: "Call or text 988", href: "tel:988" },
  },
  {
    name: "NCMEC CyberTipline",
    what: "Report online sexual exploitation of a child.",
    phone: { label: "1-800-843-5678", href: "tel:18008435678" },
    link: { label: "report.cybertip.org", href: "https://report.cybertip.org" },
  },
  {
    name: "Take It Down",
    what: "Help removing nude or sexual images of someone under 18.",
    link: { label: "takeitdown.ncmec.org", href: "https://takeitdown.ncmec.org/" },
  },
  {
    name: "Childhelp",
    what: "Child abuse hotline.",
    phone: { label: "1-800-422-4453", href: "tel:18004224453" },
  },
  {
    name: "RAINN",
    what: "Sexual assault hotline.",
    phone: { label: "1-800-656-4673", href: "tel:18006564673" },
  },
  {
    name: "Stop It Now",
    what: "Confidential help if you're worried about a child's or adult's sexual behavior.",
    phone: { label: "1-888-773-8368", href: "tel:18887738368" },
    link: { label: "stopitnow.org/help", href: "https://stopitnow.org/help" },
  },
  {
    name: "ANAD eating disorders helpline",
    what: "Support and referrals. Not a crisis line.",
    phone: { label: "1-888-375-7767", href: "tel:18883757767" },
  },
];

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
          {RESOURCES.map((r) => (
            <li key={r.name} className="rounded-3xl border border-border/80 bg-card p-5">
              <h2 className="text-[19px] font-semibold text-foreground">{r.name}</h2>
              <p className="mt-1 text-[17px] text-muted-foreground">{r.what}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[17px]">
                {r.phone && (
                  <a href={r.phone.href} className="font-medium text-primary underline underline-offset-4">
                    {r.phone.label}
                  </a>
                )}
                {r.link && (
                  <a
                    href={r.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline underline-offset-4"
                  >
                    {r.link.label}
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
