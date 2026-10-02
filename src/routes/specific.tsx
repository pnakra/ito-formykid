import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header, Footer } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { AGE_BANDS, AGE_OPTIONS, WHERE_OPTIONS, FREQUENCY_OPTIONS, QUESTION_OPTIONS, DANGER_OPTIONS, CONCERN_OPTIONS, OBSERVATION_GROUPS } from "@/config/intake";

const TITLE = "Make this more specific — is this ok for my kid?";
const DESC = "Add any details that might help, or go straight to your answer.";

export const Route = createFileRoute("/specific")({
  head: () => ({ meta: [
    { title: TITLE }, { name: "description", content: DESC },
    { property: "og:title", content: TITLE }, { property: "og:description", content: DESC },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: SpecificPage,
});

type Intake = {
  query: string; inputMode: "lookup" | "describe"; age?: string; age_band?: string;
  where?: string; frequency?: string; question_on_mind?: string; danger_now?: string;
  concerns?: string[]; observations?: string[]; extra_detail?: string;
};

function SpecificPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [intake, setIntake] = useState<Intake | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("scanIntake");
      const value = raw ? JSON.parse(raw) as Intake : null;
      if (!value?.query?.trim()) { navigate({ to: "/scan", replace: true }); return; }
      setIntake(value);
    } catch { navigate({ to: "/scan", replace: true }); }
  }, [navigate]);

  if (!intake) return null;

  const set = (change: Partial<Intake>) => setIntake((current) => current ? { ...current, ...change } : current);
  const toggle = (key: "concerns" | "observations", value: string) => {
    const list = intake[key] ?? [];
    set({ [key]: list.includes(value) ? list.filter((x) => x !== value) : [...list, value] });
  };
  const finish = () => {
    if (intake.danger_now === "Yes") { navigate({ to: "/help" }); return; }
    const extra = Object.entries(notes).filter(([, value]) => value.trim()).map(([label, value]) => `${label}: ${value.trim()}`).join("\n").slice(0, 700);
    sessionStorage.setItem("scanIntake", JSON.stringify({ ...intake, extra_detail: extra }));
    navigate({ to: "/results" });
  };
  const note = (label: string) => (
    <div className="mt-3">
      <label htmlFor={`note-${label}`} className="block text-[15px] text-muted-foreground mb-2">Something else? (optional)</label>
      <Textarea id={`note-${label}`} value={notes[label] ?? ""} maxLength={300} onChange={(e) => setNotes((prev) => ({ ...prev, [label]: e.target.value }))} className="min-h-20" />
    </div>
  );
  const section = (label: string, children: React.ReactNode) => (
    <section className="border-t border-border pt-6 space-y-3" key={label}>
      <h2 className="font-display text-[20px] font-medium text-foreground">{label} <span className="font-body text-[15px] font-normal text-muted-foreground">(optional)</span></h2>
      {children}
      {note(label)}
    </section>
  );
  const choices = (options: string[], selected: string | undefined, choose: (value: string) => void) => (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => <Button key={option} type="button" variant={selected === option ? "default" : "outline"} onClick={() => choose(selected === option ? "" : option)} className="h-auto min-h-11 whitespace-normal text-left py-2">{option}</Button>)}
    </div>
  );
  const multi = (options: string[], selected: string[], choose: (value: string) => void) => (
    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
      {options.map((option) => <Button key={option} type="button" variant={selected.includes(option) ? "default" : "outline"} onClick={() => choose(option)} className="h-auto min-h-11 whitespace-normal justify-start text-left py-2">{option}</Button>)}
    </div>
  );

  return <div className="min-h-screen flex flex-col bg-background">
    <Header isLoggedIn={!!user} />
    <main className="flex-1 py-10 md:py-16">
      <div className="mx-auto max-w-2xl px-5">
        <p className="label-text text-primary mb-3">BEFORE YOUR REPORT</p>
        <h1 className="font-display text-[30px] font-medium text-foreground">Make this more specific</h1>
        <p className="mt-3 text-[17px] text-muted-foreground">Everything here is optional. Skip any question you don't know.</p>
        <Button variant="outline" className="mt-5" onClick={finish}>Skip to report</Button>
        <div className="mt-8 space-y-8">
          {section("Their age", <>
            {choices(AGE_BANDS, intake.age_band, (age_band) => set({ age_band }))}
            <label className="block text-[15px] text-muted-foreground" htmlFor="specific-age">Exact age, if you know it</label>
            <select id="specific-age" value={intake.age ?? ""} onChange={(e) => set({ age: e.target.value })} className="h-11 rounded-lg border border-input bg-background px-3 text-foreground">
              <option value="">Not sure</option>{AGE_OPTIONS.map((age) => <option key={age} value={age}>{age}</option>)}
            </select>
          </>)}
          {section("Where this came up", choices(WHERE_OPTIONS, intake.where, (where) => set({ where })))}
          {section("How often", choices(FREQUENCY_OPTIONS, intake.frequency, (frequency) => set({ frequency })))}
          {section("Which question is on your mind?", choices(QUESTION_OPTIONS, intake.question_on_mind, (question_on_mind) => set({ question_on_mind })))}
          {section("What are you concerned about?", multi(CONCERN_OPTIONS, intake.concerns ?? [], (value) => toggle("concerns", value)))}
          {OBSERVATION_GROUPS.map((group) => section(group.label, multi(group.items, intake.observations ?? [], (value) => toggle("observations", value))))}
          {section("Could someone be in danger right now?", <>
            {choices(DANGER_OPTIONS, intake.danger_now, (danger_now) => set({ danger_now }))}
            {intake.danger_now === "Yes" && <p className="text-foreground">We'll take you to people who can help right now.</p>}
          </>)}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button onClick={finish} size="lg">{intake.danger_now === "Yes" ? "Get help now" : "See my report"}</Button>
        </div>
        <p className="mt-5 text-[15px] text-muted-foreground">Please leave out names and identifying details. <Link to="/privacy" className="underline">How we handle what you type</Link></p>
      </div>
    </main><Footer />
  </div>;
}