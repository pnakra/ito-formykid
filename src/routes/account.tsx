import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account — is this ok?" },
      { name: "description", content: "Manage your account, saved reports, and monthly digest settings." },
    ],
  }),
  component: AccountPage,
});

const SPECTRUM_COLORS: Record<string, string> = {
  "Mainstream": "low",
  "Edgy but benign": "neutral",
  "Concerning": "concerning",
  "High risk": "high",
} as const;

interface ScanRow {
  id: string;
  input_content: string;
  risk_level: string;
  created_at: string;
  notes: { id: string; note_text: string; created_at: string }[];
}

function AccountPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<{
    email: string;
    digest_enabled: boolean;
    digest_age_group: string | null;
  } | null>(null);

  const [scans, setScans] = useState<ScanRow[]>([]);
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/" });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    // Load profile
    supabase
      .from("profiles")
      .select("email, digest_enabled, digest_age_group")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data as any);
      });

    // Load scans with notes
    loadScans();
  }, [user]);

  const loadScans = async () => {
    if (!user) return;
    const { data: scanData } = await supabase
      .from("scans")
      .select("id, input_content, risk_level, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!scanData) return;

    const { data: notesData } = await supabase
      .from("scan_notes")
      .select("id, scan_id, note_text, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    const notesMap = new Map<string, { id: string; note_text: string; created_at: string }[]>();
    notesData?.forEach((n: any) => {
      const list = notesMap.get(n.scan_id) || [];
      list.push({ id: n.id, note_text: n.note_text, created_at: n.created_at });
      notesMap.set(n.scan_id, list);
    });

    setScans(
      scanData.map((s: any) => ({
        ...s,
        notes: notesMap.get(s.id) || [],
      }))
    );
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };


  const handleDigestToggle = async (enabled: boolean) => {
    if (!user || !profile) return;
    setProfile({ ...profile, digest_enabled: enabled });
    await supabase
      .from("profiles")
      .update({ digest_enabled: enabled })
      .eq("id", user.id);
  };

  const handleAgeGroupChange = async (value: string) => {
    if (!user || !profile) return;
    setProfile({ ...profile, digest_age_group: value });
    await supabase
      .from("profiles")
      .update({ digest_age_group: value })
      .eq("id", user.id);
  };

  const handleSaveNote = async (scanId: string) => {
    if (!user || !noteText.trim()) return;
    setSavingNote(true);
    await supabase.from("scan_notes").insert({
      scan_id: scanId,
      user_id: user.id,
      note_text: noteText.trim(),
    });
    setNoteText("");
    setNoteOpen(null);
    setSavingNote(false);
    await loadScans();
  };

  const extractQuery = (content: string) => {
    const match = content.match(/Specific thing to analyze:\s*(.+)/);
    return match ? match[1].trim() : content.slice(0, 60);
  };

  const extractAge = (content: string) => {
    const match = content.match(/Child's age:\s*(\d+)/);
    return match ? match[1] : null;
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={true} />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-xl px-5 space-y-8">

          {/* ─── Account ─── */}
          <section>
            <h1 className="text-2xl font-medium text-foreground mb-4">Account</h1>
            <div className="rounded-[14px] border bg-card p-5 space-y-4">
              <div>
                <p className="label-text mb-1">Email</p>
                <p className="text-[18px] text-foreground">{profile?.email ?? user.email}</p>
              </div>




              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  Sign out
                </Button>
              </div>
            </div>
          </section>

          {/* ─── Monthly Digest ─── */}
          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">Monthly digest</h2>
            <div className="rounded-[14px] border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[18px] text-foreground">Send me the monthly digest</p>
                </div>
                <Switch
                  checked={profile?.digest_enabled ?? true}
                  onCheckedChange={handleDigestToggle}
                />
              </div>

              <div>
                <p className="label-text mb-2">My child's age group</p>
                <div className="flex flex-wrap gap-2">
                  {["11-13", "14-15", "16-17", "18"].map((group) => (
                    <button
                      key={group}
                      onClick={() => handleAgeGroupChange(group)}
                      className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                        profile?.digest_age_group === group
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border text-secondary-foreground hover:bg-accent"
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-hint">
                The digest is tailored to your child's age group. We send it once a month — no spam.
              </p>
            </div>
          </section>

          {/* ─── Saved Reports ─── */}
          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">Saved reports</h2>

            {scans.length === 0 ? (
              <div className="rounded-[14px] border bg-card p-5 text-center">
                <p className="text-muted-foreground">No saved reports yet.</p>
                <Link to="/scan">
                  <Button size="sm" className="mt-3">Look something up</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {scans.map((scan) => {
                  const query = extractQuery(scan.input_content);
                  const age = extractAge(scan.input_content);
                  const badgeVariant = SPECTRUM_COLORS[scan.risk_level] as any || "neutral";

                  return (
                    <div key={scan.id} className="rounded-[14px] border bg-card overflow-hidden">
                      {/* Main row */}
                      <button
                        className="w-full p-4 flex items-center gap-3 text-left hover:bg-accent/50 transition-colors"
                        onClick={() => {
                          // Store minimal data to reopen the result
                          sessionStorage.setItem("viewScanId", scan.id);
                          navigate({ to: "/history" });
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[18px] text-foreground font-medium truncate">
                            {query}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={badgeVariant} className="text-[11px]">
                              {scan.risk_level}
                            </Badge>
                            {age && (
                              <span className="text-xs text-hint">Age {age}</span>
                            )}
                            <span className="text-xs text-hint">
                              {new Date(scan.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-hint shrink-0" />
                      </button>

                      {/* Notes */}
                      {scan.notes.length > 0 && (
                        <div className="px-4 pb-2 space-y-1">
                          {scan.notes.map((note) => (
                            <div key={note.id} className="text-sm text-muted-foreground pl-3 border-l-2 border-border py-1">
                              <p>{note.note_text}</p>
                              <p className="text-[11px] text-hint mt-0.5">
                                {new Date(note.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add note prompt */}
                      <div className="px-4 pb-3">
                        {noteOpen === scan.id ? (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Log a new signal or note an improvement…"
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              className="text-sm min-h-[60px] bg-background"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveNote(scan.id)}
                                disabled={savingNote || !noteText.trim()}
                              >
                                {savingNote ? "Saving…" : "Save note"}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => { setNoteOpen(null); setNoteText(""); }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="text-xs text-hint hover:text-muted-foreground transition-colors"
                            onClick={() => { setNoteOpen(scan.id); setNoteText(""); }}
                          >
                            Any updates? Tap to log a new signal or note an improvement
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
