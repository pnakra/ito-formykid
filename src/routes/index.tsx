import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DESCRIBE_EXAMPLES } from "@/config/intake";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Worried about something your kid saw online?" },
      {
        name: "description",
        content:
          "Describe what you noticed. Get a plain-language explanation and one good way to bring it up. Free, from a nonprofit.",
      },
      { property: "og:title", content: "Worried about something your kid saw online?" },
      {
        property: "og:description",
        content: "Describe what you noticed. Get a plain-language explanation and one good way to bring it up.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LandingPage,
});

const CHIPS = DESCRIBE_EXAMPLES.slice(0, 3);

function LandingPage() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");

  const appendChip = (chip: string) => {
    setDescription((prev) => (prev ? `${prev.trimEnd()} ${chip}` : chip));
  };

  const handleSubmit = () => {
    const value = description.trim();
    if (!value) return;
    sessionStorage.setItem("itok_input_mode", "describe");
    sessionStorage.setItem(
      "scanIntake",
      JSON.stringify({
        age: "",
        gender: "",
        concerns: [],
        observations: [],
        query: value,
        inputMode: "describe",
      })
    );
    navigate({ to: "/results" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-5">
          <Link to="/" className="text-[15px] font-medium tracking-[0.06em] text-hint">
            is this ok for my kid?
          </Link>
          <Link to="/login" className="text-[15px] text-hint hover:text-foreground transition-colors">
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Above the fold */}
        <section className="pt-10 pb-14 md:pt-14">
          <div className="mx-auto max-w-2xl px-5">
            <h1
              className="text-[26px] md:text-[34px] leading-[1.25] mb-4 text-foreground"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
            >
              Worried about something your kid saw online?
            </h1>
            <p className="text-[16px] text-muted-foreground leading-[1.6] mb-6 max-w-lg">
              Describe what you noticed. Get a plain-language explanation and one good way to bring it up.
            </p>

            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A comment, an attitude shift, something they said…"
              aria-label="Describe what you noticed"
              className="min-h-[120px] text-[18px] leading-relaxed rounded-[8px]"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => appendChip(chip)}
                  className="rounded-[6px] border border-border bg-background px-3 py-1.5 text-[15px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors text-left"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="mt-5">
              <Button onClick={handleSubmit} disabled={!description.trim()} size="lg" className="text-[17px] px-6">
                Get context
              </Button>
            </div>

            <p className="mt-4 text-[15px] text-hint">
              Free. Built by a nonprofit. We never see your child's phone.
            </p>
          </div>
        </section>

        {/* What you get back — a real example */}
        <section className="py-14 md:py-16 bg-card">
          <div className="mx-auto max-w-2xl px-5">
            <p className="label-text mb-6">WHAT YOU GET BACK</p>

            <div className="border border-border rounded-[10px] bg-background p-5 md:p-6 space-y-5">
              <p className="text-[15px] text-hint">
                "He started referring to girls as 'females'"
              </p>

              <div>
                <p className="text-[15px] text-hint mb-1">What this is</p>
                <p className="text-[18px] text-foreground leading-[1.7]">
                  It's a word used in some online videos about dating and status. Boys often repeat it before they understand it.
                </p>
              </div>

              <div>
                <p className="text-[15px] text-hint mb-1">Is this common?</p>
                <p className="text-[18px] text-foreground leading-[1.7]">
                  Yes. Many 13-year-old boys try out language they hear online.
                </p>
              </div>

              <div>
                <p className="text-[15px] text-hint mb-1">What not to do</p>
                <ul className="text-[18px] text-foreground leading-[1.7] space-y-1">
                  <li>Don't call him sexist.</li>
                  <li>Don't ban the app on the spot.</li>
                  <li>Don't ask who taught him that.</li>
                </ul>
              </div>

              <div>
                <p className="text-[15px] text-hint mb-1">One way to bring it up</p>
                <p className="text-[18px] text-foreground leading-[1.7]">
                  "I heard you say 'females' the other day. What does that word mean to you?"
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What this isn't */}
        <section className="py-14 md:py-16">
          <div className="mx-auto max-w-2xl px-5">
            <p className="label-text mb-6">WHAT THIS ISN'T</p>
            <div className="space-y-3">
              <p className="text-[18px] text-foreground leading-[1.7]">Not monitoring. We never touch their phone.</p>
              <p className="text-[18px] text-foreground leading-[1.7]">Not a verdict on your parenting.</p>
              <p className="text-[18px] text-foreground leading-[1.7]">Not a script you have to follow.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-10">
        <div className="mx-auto max-w-2xl px-5">
          <p className="text-[15px] font-medium text-foreground mb-2">is this ok for my kid?</p>
          <p className="text-[15px] text-hint leading-[1.75] mb-4">
            Made by Override Labs, a nonprofit. We are not affiliated with any platform, creator, or advertiser.
          </p>
          <div className="flex gap-4 text-[15px]">
            <Link to="/why" className="text-hint hover:text-foreground transition-colors">Why this?</Link>
            <Link to="/login" className="text-hint hover:text-foreground transition-colors">Sign in</Link>
            <a href="https://isthisok.app" target="_blank" rel="noopener noreferrer" className="text-hint hover:text-foreground transition-colors">isthisok.app</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
