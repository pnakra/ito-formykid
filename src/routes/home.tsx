import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronRight, Plus, Search, TrendingUp, BookOpen, Shield, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — is this ok?" },
      { name: "description", content: "Understand something worrying right now, or stay ahead of harmful online influence over time." },
    ],
  }),
  component: HomePage,
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) ?? undefined,
  }) as { tab?: string },
});

const SPECTRUM_COLORS: Record<string, string> = {
  "Mainstream": "low",
  "Edgy but benign": "neutral",
  "Concerning": "concerning",
  "High risk": "high",
};

const AUTOFILL_CHIPS = ["Andrew Tate", "looksmaxxing", "Fresh & Fit", "redpill"];

const DESCRIBE_EXAMPLES = [
  "He started calling girls 'females'",
  "She stopped eating and started talking about her body differently",
  "He dismissed his female teacher",
  "His whole attitude toward women changed",
];

type InputMode = "describe" | "lookup";

const LOG_CATEGORIES = [
  "Language shift",
  "Attitude change",
  "New community",
  "Body image",
  "Withdrawal",
  "Positive sign",
];

const PROTECTIVE_FACTORS = [
  { key: "open_conversations", label: "Open conversations about what they're seeing online" },
  { key: "come_without_judgment", label: "They feel they can come to me without judgment" },
  { key: "offline_friendships", label: "They have strong offline friendships and interests" },
  { key: "question_and_pushback", label: "They can question and push back on things they see" },
  { key: "stable_identity", label: "They have a stable sense of their own identity and values" },
];

type FactorStatus = "good" | "needs_attention" | "not_sure";

function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { tab: searchTab } = Route.useSearch();

  const [profile, setProfile] = useState<{
    scan_count: number;
    digest_age_group: string | null;
  } | null>(null);

  const [activeMode, setActiveMode] = useState<"understand" | "stay_ahead">(
    (searchTab as "understand" | "stay_ahead") || "stay_ahead"
  );
  const [query, setQuery] = useState("");
  const [description, setDescription] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>(() => {
    if (typeof window === "undefined") return "describe";
    const stored = sessionStorage.getItem("itok_input_mode");
    return stored === "lookup" ? "lookup" : "describe";
  });

  useEffect(() => {
    sessionStorage.setItem("itok_input_mode", inputMode);
  }, [inputMode]);

  const handleModeChange = (next: InputMode) => {
    if (next === inputMode) return;
    if (inputMode === "describe") setDescription("");
    else setQuery("");
    setInputMode(next);
  };

  // Recent scans
  const [recentScans, setRecentScans] = useState<any[]>([]);

  // Monthly briefing
  const [briefing, setBriefing] = useState<{ bullets: string[]; protective_factor_note: string } | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);

  // Situation log
  const [logEntries, setLogEntries] = useState<any[]>([]);
  const [logNote, setLogNote] = useState("");
  const [logCategory, setLogCategory] = useState<string | null>(null);
  const [savingLog, setSavingLog] = useState(false);
  const [patternSummary, setPatternSummary] = useState<string | null>(null);
  const [patternLoading, setPatternLoading] = useState(false);

  // Protective factors
  const [factors, setFactors] = useState<Record<string, FactorStatus>>({
    open_conversations: "not_sure",
    come_without_judgment: "not_sure",
    offline_friendships: "not_sure",
    question_and_pushback: "not_sure",
    stable_identity: "not_sure",
  });
  const [factorSuggestions, setFactorSuggestions] = useState<Record<string, string>>({});
  const [factorsLoading, setFactorsLoading] = useState(false);

  // Sync search param to active mode
  useEffect(() => {
    if (searchTab === "understand" || searchTab === "stay_ahead") {
      setActiveMode(searchTab);
    }
  }, [searchTab]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("profiles")
      .select("scan_count, digest_age_group")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          // New user = 0 scans → default to Understand now
          if (data.scan_count === 0 && !searchTab) setActiveMode("understand");
        }
      });

    // Recent scans
    supabase
      .from("scans")
      .select("id, input_content, risk_level, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setRecentScans(data);
      });

    // Situation log
    loadLogEntries();

    // Protective factors
    supabase
      .from("protective_factors")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setFactors({
            open_conversations: data.open_conversations as FactorStatus,
            come_without_judgment: data.come_without_judgment as FactorStatus,
            offline_friendships: data.offline_friendships as FactorStatus,
            question_and_pushback: data.question_and_pushback as FactorStatus,
            stable_identity: data.stable_identity as FactorStatus,
          });
        }
      });
  }, [user]);

  const loadLogEntries = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("situation_log")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (data) setLogEntries(data);
  }, [user]);

  // Load monthly briefing (cached)
  const loadBriefing = useCallback(async () => {
    if (!user || !profile?.digest_age_group) return;
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Check cache
    const { data: cached } = await supabase
      .from("monthly_briefing_cache")
      .select("bullets, protective_factor_note")
      .eq("user_id", user.id)
      .eq("month_key", monthKey)
      .single();

    if (cached) {
      setBriefing({ bullets: cached.bullets as string[], protective_factor_note: cached.protective_factor_note });
      return;
    }

    setBriefingLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/home-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ action: "monthly_briefing", ageGroup: profile.digest_age_group }),
        }
      );
      if (!res.ok) throw new Error("Failed");
      const result = await res.json();
      setBriefing(result);

      // Cache it
      await supabase.from("monthly_briefing_cache").insert({
        user_id: user.id,
        month_key: monthKey,
        age_group: profile.digest_age_group,
        bullets: result.bullets,
        protective_factor_note: result.protective_factor_note,
      });
    } catch {
      // Silently fail
    } finally {
      setBriefingLoading(false);
    }
  }, [user, profile?.digest_age_group]);

  useEffect(() => {
    if (profile?.digest_age_group) loadBriefing();
  }, [profile?.digest_age_group, loadBriefing]);

  // Pattern summary
  useEffect(() => {
    if (logEntries.length >= 3 && user) {
      loadPatternSummary();
    }
  }, [logEntries.length]);

  const loadPatternSummary = async () => {
    if (!user || logEntries.length < 3) return;
    setPatternLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const notes = logEntries.slice(0, 10).map((e: any) => ({
        date: e.logged_date,
        category: e.category,
        text: e.note_text,
      }));
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/home-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ action: "pattern_summary", notes }),
        }
      );
      if (!res.ok) throw new Error("Failed");
      const result = await res.json();
      setPatternSummary(result.pattern_summary);
    } catch {
      // Silently fail
    } finally {
      setPatternLoading(false);
    }
  };

  const handleLogSubmit = async () => {
    if (!user || !logNote.trim()) return;
    setSavingLog(true);
    await supabase.from("situation_log").insert({
      user_id: user.id,
      note_text: logNote.trim(),
      category: logCategory,
    });
    setLogNote("");
    setLogCategory(null);
    setSavingLog(false);
    await loadLogEntries();
  };

  const handleFactorChange = async (key: string, status: FactorStatus) => {
    if (!user) return;
    const updated = { ...factors, [key]: status };
    setFactors(updated);

    // Upsert to DB
    const { data: existing } = await supabase
      .from("protective_factors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    const updatePayload = {
      open_conversations: updated.open_conversations,
      come_without_judgment: updated.come_without_judgment,
      offline_friendships: updated.offline_friendships,
      question_and_pushback: updated.question_and_pushback,
      stable_identity: updated.stable_identity,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      await supabase
        .from("protective_factors")
        .update(updatePayload)
        .eq("user_id", user.id);
    } else {
      await supabase.from("protective_factors").insert({
        user_id: user.id,
        ...updatePayload,
      });
    }

    // Get suggestions for needs_attention items
    const needsAttention = Object.entries(updated)
      .filter(([, v]) => v === "needs_attention")
      .map(([k]) => PROTECTIVE_FACTORS.find((f) => f.key === k)?.label)
      .filter(Boolean);

    if (needsAttention.length > 0) {
      setFactorsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/home-ai`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ action: "protective_suggestions", factors: needsAttention }),
          }
        );
        if (!res.ok) throw new Error("Failed");
        const result = await res.json();
        const map: Record<string, string> = {};
        result.suggestions?.forEach((s: any) => {
          const matchedKey = PROTECTIVE_FACTORS.find((f) => f.label === s.factor)?.key;
          if (matchedKey) map[matchedKey] = s.suggestion;
        });
        setFactorSuggestions(map);
      } catch {
        // Silently fail
      } finally {
        setFactorsLoading(false);
      }
    }
  };

  const handleScanSubmit = () => {
    const text = inputMode === "describe" ? description.trim() : query.trim();
    if (!text) return;
    const intakeData: {
      age: string;
      gender: string;
      concerns: string[];
      observations: string[];
      query: string;
      inputMode: InputMode;
    } = {
      age: "",
      gender: "",
      concerns: [],
      observations: [],
      query: text,
      inputMode,
    };
    if (profile?.digest_age_group) {
      const ageMap: Record<string, string> = {
        "11-13": "12",
        "14-15": "14",
        "16-17": "16",
        "18": "18",
      };
      intakeData.age = ageMap[profile.digest_age_group] || "";
    }
    sessionStorage.setItem("scanIntake", JSON.stringify(intakeData));
    sessionStorage.setItem("itok_input_mode", inputMode);
    navigate({ to: "/results" });
  };

  const extractQuery = (content: string) => {
    const match = content.match(/Specific thing to analyze:\s*(.+)/);
    return match ? match[1].trim() : content.slice(0, 60);
  };

  if (authLoading || !user) return null;

  const now = new Date();
  const monthYear = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const ageGroupLabel = profile?.digest_age_group ? `${profile.digest_age_group}-year-olds` : "";

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={true} />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-xl px-5">

          {/* Mode switcher */}
          <div className="flex rounded-[10px] bg-muted p-1 mb-8">
            <button
              onClick={() => setActiveMode("understand")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-[8px] px-4 py-2.5 text-[17px] font-medium transition-all ${
                activeMode === "understand"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              Understand now
            </button>
            <button
              onClick={() => setActiveMode("stay_ahead")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-[8px] px-4 py-2.5 text-[17px] font-medium transition-all ${
                activeMode === "stay_ahead"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Stay ahead
            </button>
          </div>

          {/* ─── UNDERSTAND NOW ─── */}
          {activeMode === "understand" && (
            <div>
              <div className="rounded-[14px] bg-card p-5 mb-6">
                <h2 className="text-xl font-medium text-foreground mb-1">What do you want to understand?</h2>
                <p className="text-[15px] text-hint mb-4">
                  Describe what you noticed, or look up a specific creator, term, or community.
                </p>

                {/* Mode toggle — typographic, minimal */}
                <div className="flex items-center gap-6 mb-4">
                  <button
                    type="button"
                    onClick={() => handleModeChange("describe")}
                    className={`text-[17px] pb-1 transition-colors ${
                      inputMode === "describe"
                        ? "text-foreground font-medium border-b border-foreground"
                        : "text-hint hover:text-foreground"
                    }`}
                  >
                    Something happened
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange("lookup")}
                    className={`text-[17px] pb-1 transition-colors ${
                      inputMode === "lookup"
                        ? "text-foreground font-medium border-b border-foreground"
                        : "text-hint hover:text-foreground"
                    }`}
                  >
                    Look something up
                  </button>
                </div>

                {inputMode === "describe" ? (
                  <>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what you noticed — a comment, an attitude shift, a change in behavior, something they said..."
                      className="min-h-[120px] mb-3"
                    />
                    <div className="flex flex-wrap gap-2 mb-4">
                      {DESCRIBE_EXAMPLES.map((example) => (
                        <button
                          key={example}
                          type="button"
                          onClick={() =>
                            setDescription(
                              description ? `${description.trimEnd()} ${example}` : example
                            )
                          }
                          className="rounded-[6px] border border-border bg-background px-3 py-1.5 text-[15px] text-secondary-foreground hover:bg-accent transition-colors text-left"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <Textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder='e.g. Andrew Tate, "sigma male", Fresh & Fit, "looksmaxxing"...'
                      className="min-h-[80px] mb-3"
                    />
                    <div className="flex flex-wrap gap-2 mb-4">
                      {AUTOFILL_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setQuery(query ? `${query}, ${chip}` : chip)}
                          className="rounded-[20px] border border-border bg-background px-3 py-1 text-sm text-secondary-foreground hover:bg-accent transition-colors"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <Button
                  onClick={handleScanSubmit}
                  disabled={inputMode === "describe" ? !description.trim() : !query.trim()}
                  className="w-full"
                >
                  {inputMode === "describe" ? "Understand this" : "Get my report"}
                </Button>

                <p className="text-[13px] text-hint mt-3 text-center">
                  Your child's profile is saved. Update it anytime in{" "}
                  <Link to="/account" className="text-foreground underline underline-offset-4">Account</Link>.
                </p>
              </div>

              {/* Recent scans */}
              {recentScans.length > 0 && (
                <div>
                  <p className="label-text mb-2">RECENT LOOKUPS</p>
                  <div className="space-y-2">
                    {recentScans.map((scan) => {
                      const term = extractQuery(scan.input_content);
                      const badgeVariant = SPECTRUM_COLORS[scan.risk_level] as any || "neutral";
                      return (
                        <button
                          key={scan.id}
                          className="w-full rounded-[14px] border bg-card p-4 flex items-center gap-3 text-left hover:bg-accent/50 transition-colors"
                          onClick={() => {
                            sessionStorage.setItem("viewScanId", scan.id);
                            navigate({ to: "/history" });
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-[18px] text-foreground font-medium truncate">{term}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={badgeVariant} className="text-[11px]">{scan.risk_level}</Badge>
                              <span className="text-xs text-hint">
                                {new Date(scan.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-hint shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                  <Link to="/history" className="block mt-3 text-sm text-foreground underline underline-offset-4 text-center">
                    See all saved reports →
                  </Link>
                </div>
              )}

              {/* Nudge to Stay Ahead */}
              <div className="mt-8 rounded-[14px] border border-dashed p-5 text-center">
                <p className="text-[17px] text-muted-foreground leading-relaxed mb-3">
                  Looking things up is important — but staying ahead is even better. Track patterns, get monthly briefings, and strengthen what protects your child over time.
                </p>
                <button
                  onClick={() => setActiveMode("stay_ahead")}
                  className="text-[15px] font-medium text-foreground underline underline-offset-4"
                >
                  Explore Stay ahead →
                </button>
              </div>
            </div>
          )}

          {/* ─── STAY AHEAD ─── */}
          {activeMode === "stay_ahead" && (
            <div className="space-y-8">

              {/* Intro */}
              <div>
                <p className="text-[17px] text-muted-foreground leading-relaxed">
                  You don't need a crisis to use this. These tools help you notice patterns, stay informed, and strengthen the things that keep your child resilient.
                </p>
              </div>

              {/* Section 1: Monthly briefing */}
              <section>
                <p className="label-text mb-1">THIS MONTH · {monthYear.toUpperCase()}</p>
                {profile?.digest_age_group ? (
                  <>
                    <h2 className="text-lg font-medium text-foreground mb-4">
                      What {ageGroupLabel} are likely seeing right now
                    </h2>

                    {briefingLoading ? (
                      <div className="rounded-[14px] bg-card p-5 flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Generating briefing…
                      </div>
                    ) : briefing ? (
                      <div className="space-y-3">
                        <div className="rounded-[14px] bg-card p-5">
                          <ul className="space-y-3">
                            {briefing.bullets.map((bullet, i) => (
                              <li key={i} className="text-[18px] text-foreground leading-relaxed flex gap-2">
                                <span className="text-hint mt-0.5 shrink-0">•</span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-[14px] border-l-4 border-risk-low-foreground bg-risk-low/30 px-4 py-3">
                          <p className="label-text mb-1">PROTECTIVE FACTOR</p>
                          <p className="text-sm text-foreground leading-relaxed">{briefing.protective_factor_note}</p>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="rounded-[14px] bg-card p-5 text-center">
                    <p className="text-muted-foreground mb-2">Set your child's age group to get a personalized monthly briefing.</p>
                    <Link to="/account">
                      <Button variant="outline" size="sm">Go to Settings</Button>
                    </Link>
                  </div>
                )}
              </section>

              {/* Section 2: Situation log */}
              <section>
                <p className="label-text mb-1">YOUR SITUATION LOG</p>
                <p className="text-[15px] text-hint mb-4">
                  Track what you notice over time. Even small observations add up to a clearer picture.
                </p>

                <div className="rounded-[14px] bg-card p-5 mb-4">
                  <Textarea
                    value={logNote}
                    onChange={(e) => setLogNote(e.target.value)}
                    placeholder="What did you notice?"
                    className="min-h-[60px] mb-3"
                  />
                  <div className="flex flex-wrap gap-2 mb-3">
                    {LOG_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setLogCategory(logCategory === cat ? null : cat)}
                        className={`rounded-[20px] border px-3 py-1 text-[13px] transition-colors ${
                          logCategory === cat
                            ? "bg-primary text-primary-foreground border-transparent"
                            : "bg-background text-secondary-foreground border-border"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <Button
                    onClick={handleLogSubmit}
                    disabled={!logNote.trim() || savingLog}
                    size="sm"
                  >
                    {savingLog ? "Saving…" : "Log it"}
                  </Button>
                </div>

                {/* Pattern summary */}
                {patternLoading && (
                  <div className="rounded-[14px] bg-card p-4 mb-4 flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" /> Analyzing patterns…
                  </div>
                )}
                {patternSummary && (
                  <div className="rounded-[14px] border-l-4 border-risk-concerning-foreground bg-risk-concerning/30 px-4 py-3 mb-4">
                    <p className="label-text mb-1">PATTERN SUMMARY</p>
                    <p className="text-sm text-foreground leading-relaxed">{patternSummary}</p>
                  </div>
                )}

                {/* Log entries */}
                {logEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Start logging what you notice. Even small observations add up to a picture over time.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {logEntries.map((entry: any) => (
                      <div key={entry.id} className="rounded-[14px] border bg-card px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-hint">
                            {new Date(entry.logged_date).toLocaleDateString()}
                          </span>
                          {entry.category && (
                            <Badge variant="chip" className="text-[11px]">{entry.category}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground">{entry.note_text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Section 3: Protective factors */}
              <section>
                <p className="label-text mb-1">PROTECTIVE FACTORS</p>
                <p className="text-[15px] text-hint mb-4">
                  Research shows these reduce vulnerability to harmful online influence. Reflect on where your family stands.
                </p>

                <div className="space-y-3">
                  {PROTECTIVE_FACTORS.map((factor) => {
                    const status = factors[factor.key] || "not_sure";
                    const suggestion = factorSuggestions[factor.key];
                    return (
                      <div key={factor.key} className="rounded-[14px] border bg-card px-4 py-3">
                        <p className="text-[17px] text-foreground mb-2">{factor.label}</p>
                        <div className="flex gap-2">
                          {(["good", "needs_attention", "not_sure"] as const).map((opt) => {
                            const labels: Record<string, string> = {
                              good: "Good",
                              needs_attention: "Needs attention",
                              not_sure: "Not sure",
                            };
                            return (
                              <button
                                key={opt}
                                onClick={() => handleFactorChange(factor.key, opt)}
                                className={`rounded-[20px] border px-3 py-1 text-[13px] transition-colors ${
                                  status === opt
                                    ? opt === "good"
                                      ? "bg-risk-low text-risk-low-foreground border-transparent"
                                      : opt === "needs_attention"
                                        ? "bg-risk-concerning text-risk-concerning-foreground border-transparent"
                                        : "bg-muted text-muted-foreground border-transparent"
                                    : "bg-background text-secondary-foreground border-border"
                                }`}
                              >
                                {labels[opt]}
                              </button>
                            );
                          })}
                        </div>
                        {suggestion && status === "needs_attention" && (
                          <p className="text-[15px] text-risk-low-foreground mt-2 leading-relaxed">
                            {suggestion}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {factorsLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
                    <Loader2 className="h-3 w-3 animate-spin" /> Getting suggestions…
                  </div>
                )}

                <p className="text-[13px] text-hint mt-4 leading-relaxed">
                  Based on research into what reduces adolescent vulnerability to harmful online influence. Not a clinical assessment.
                </p>
              </section>

              {/* Nudge to Understand Now */}
              <div className="rounded-[14px] border border-dashed p-5 text-center">
                <p className="text-[17px] text-muted-foreground leading-relaxed mb-3">
                  Something worrying you right now? Look up a creator, term, or behavior and get a plain-language report in seconds.
                </p>
                <button
                  onClick={() => setActiveMode("understand")}
                  className="text-[15px] font-medium text-foreground underline underline-offset-4"
                >
                  Go to Understand now →
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
