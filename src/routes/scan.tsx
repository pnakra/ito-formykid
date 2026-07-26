import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { AGE_OPTIONS, AUTOFILL_EXAMPLES, DESCRIBE_EXAMPLES } from "@/config/intake";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Look something up — is this ok?" },
      { name: "description", content: "Tell us what you noticed and we'll help you understand what's going on." },
      { property: "og:title", content: "Look something up — is this ok?" },
      { property: "og:description", content: "Tell us what you noticed and we'll help you understand what's going on." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ScanPage,
});

type Mode = "describe" | "lookup";

const MODE_KEY = "itok_input_mode";

function ScanPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("describe");
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [age, setAge] = useState("");

  useEffect(() => {
    const storedMode = sessionStorage.getItem(MODE_KEY);
    if (storedMode === "lookup" || storedMode === "describe") setMode(storedMode);

    const stored = sessionStorage.getItem("scanIntake");
    if (stored) {
      try {
        const prior = JSON.parse(stored);
        if (prior.age) setAge(prior.age);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const handleModeChange = (next: Mode) => {
    if (next === mode) return;
    if (mode === "describe") setDescription("");
    else setQuery("");
    setMode(next);
    sessionStorage.setItem(MODE_KEY, next);
  };

  const value = mode === "describe" ? description : query;
  const examples = mode === "describe" ? DESCRIBE_EXAMPLES : AUTOFILL_EXAMPLES;

  const appendExample = (example: string) => {
    if (mode === "describe") {
      setDescription(description ? `${description.trimEnd()} ${example}` : example);
    } else {
      setQuery(example);
    }
  };

  const handleSubmit = () => {
    if (!value.trim()) return;
    sessionStorage.setItem(MODE_KEY, mode);
    sessionStorage.setItem(
      "scanIntake",
      JSON.stringify({
        age,
        gender: "",
        concerns: [],
        observations: [],
        query: value.trim(),
        inputMode: mode,
      })
    );
    navigate({ to: "/results" });
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={!!user} />

      <main className="flex-1 py-10 md:py-16">
        <div className="mx-auto max-w-xl px-5">

          {/* Mode selector — typographic, minimal */}
          <div className="mb-8 flex items-center gap-6">
            <button
              type="button"
              onClick={() => handleModeChange("describe")}
              className={`text-[14px] pb-1 transition-colors ${
                mode === "describe"
                  ? "text-foreground font-medium border-b border-foreground"
                  : "text-hint hover:text-foreground"
              }`}
            >
              Something happened
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("lookup")}
              className={`text-[14px] pb-1 transition-colors ${
                mode === "lookup"
                  ? "text-foreground font-medium border-b border-foreground"
                  : "text-hint hover:text-foreground"
              }`}
            >
              Look something up
            </button>
          </div>

          <h1
            className="text-[22px] md:text-[26px] text-foreground leading-[1.3] mb-6"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
          >
            {mode === "describe" ? "Describe what you noticed." : "What do you want to look up?"}
          </h1>

          {mode === "describe" ? (
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A comment, an attitude shift, something they said…"
              className="min-h-[160px] text-[15px] leading-relaxed rounded-[8px]"
            />
          ) : (
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="A creator, term, game, or community"
              className="h-12 text-[15px] rounded-[8px]"
            />
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => appendExample(example)}
                className="rounded-[6px] border border-border bg-background px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors text-left"
              >
                {example}
              </button>
            ))}
          </div>

          {/* Optional age */}
          <div className="mt-8">
            <div className="flex items-center gap-3">
              <label className="text-[13px] text-foreground" htmlFor="child-age">Their age</label>
              <select
                id="child-age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="h-9 rounded-[8px] border border-input bg-background px-3 text-[14px] text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">—</option>
                {AGE_OPTIONS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <p className="text-[12px] text-hint mt-2">Optional — helps us be specific.</p>
          </div>

          <div className="mt-8">
            <Button
              onClick={handleSubmit}
              disabled={!value.trim()}
              size="lg"
              className="text-[14px] px-6"
            >
              Get context
            </Button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
