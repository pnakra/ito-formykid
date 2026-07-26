import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format } from "date-fns";
import { ChevronRight, MessageSquare, Plus } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Your lookups — is this ok?" },
      { name: "description", content: "Review past lookups, add notes, and track how things are going." },
    ],
  }),
  component: HistoryPage,
});

interface ScanNote {
  id: string;
  scan_id: string;
  note_text: string;
  created_at: string;
}

interface Scan {
  id: string;
  input_type: string;
  input_content: string;
  risk_level: string;
  summary: string;
  guidance: string;
  created_at: string;
  confidence: string | null;
  age_context: string | null;
  spectrum_label: string | null;
  summary_verdict: string | null;
  status: string;
  status_updated_at: string | null;
  concern_areas: string[] | null;
  escalated?: boolean | null;

  scan_notes: ScanNote[];
}

const STATUS_OPTIONS = [
  { value: "watching", label: "Watching", color: "bg-muted text-muted-foreground" },
  { value: "improving", label: "Better", color: "bg-muted text-muted-foreground" },
  { value: "still_concerned", label: "Still worried", color: "bg-muted text-muted-foreground" },
  { value: "resolved", label: "Settled", color: "bg-muted text-muted-foreground" },
];

const SPECTRUM_COLORS: Record<string, string> = {
  "Mainstream": "bg-muted text-muted-foreground",
  "Edgy but benign": "bg-muted text-muted-foreground",
  "Concerning": "bg-muted text-foreground font-medium",
  "High risk": "bg-muted text-foreground font-medium",
};

function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [addingNoteTo, setAddingNoteTo] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadScans();
    }
  }, [user]);

  const loadScans = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("scans")
      .select("*, scan_notes(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setScans(data as any);
    }
    setLoading(false);
  };

  const handleAddNote = async (scanId: string) => {
    if (!user || !noteText.trim()) return;
    setSavingNote(true);
    await supabase.from("scan_notes").insert({
      scan_id: scanId,
      user_id: user.id,
      note_text: noteText.trim(),
    } as any);
    setNoteText("");
    setAddingNoteTo(null);
    setSavingNote(false);
    await loadScans();
  };

  const handleStatusChange = async (scanId: string, newStatus: string) => {
    if (!user) return;
    setUpdatingStatus(scanId);
    await supabase
      .from("scans")
      .update({ status: newStatus, status_updated_at: new Date().toISOString() } as any)
      .eq("id", scanId);
    setUpdatingStatus(null);
    await loadScans();
  };

  const extractQuery = (content: string) => {
    const match = content.match(/Specific thing to analyze:\s*(.+)/i);
    return match ? match[1].trim() : content.substring(0, 80);
  };

  const getStatusOption = (status: string) =>
    STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={true} />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-[34rem] px-5">
          <h1 className="text-2xl font-medium text-foreground mb-6">
            Your lookups
          </h1>


          {loading ? (
            <div className="py-12 text-center text-sm text-hint">Loading…</div>
          ) : scans.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[17px] text-hint mb-4">Nothing here yet.</p>
              <button
                onClick={() => navigate({ to: "/scan" })}
                className="text-sm text-foreground underline underline-offset-4"
              >
                Look something up
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {scans.map((scan) => {
                const isExpanded = expandedId === scan.id;
                const statusOpt = getStatusOption(scan.status);
                const noteCount = scan.scan_notes?.length || 0;
                const query = extractQuery(scan.input_content);
                const spectrumLabel = scan.spectrum_label || scan.risk_level;

                return (
                  <div
                    key={scan.id}
                    className="rounded-[14px] border bg-card overflow-hidden"
                  >
                    {/* Header row — always visible */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : scan.id)}
                      className="w-full p-5 text-left hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-[18px] font-medium text-foreground leading-snug flex-1">
                          {query}
                        </p>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 mt-0.5 transition-transform duration-200"
                          style={{
                            color: "#9AA898",
                            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                          }}
                        />
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {!scan.escalated && spectrumLabel && SPECTRUM_COLORS[spectrumLabel] && (
                          <Badge className={SPECTRUM_COLORS[spectrumLabel]}>
                            {spectrumLabel}
                          </Badge>
                        )}
                        <Badge className={statusOpt.color}>
                          {statusOpt.label}
                        </Badge>
                        {scan.confidence && (
                          <span className="text-[11px] text-hint">
                            {scan.confidence} confidence
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-[13px] text-hint">
                        <span>{formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}</span>
                        {scan.age_context && <span>Age {scan.age_context}</span>}
                        {noteCount > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {noteCount} {noteCount === 1 ? "note" : "notes"}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-5 pb-5 space-y-4 border-t">
                        {/* Verdict */}
                        {scan.summary_verdict && (
                          <div className="pt-4">
                            <p className="text-[18px] text-foreground leading-relaxed font-medium">
                              {scan.summary_verdict}
                            </p>
                          </div>
                        )}

                        {/* Summary */}
                        <div>
                          <p className="label-text mb-1">WHAT IT IS</p>
                          <p className="text-[17px] text-muted-foreground leading-relaxed">{scan.summary}</p>
                        </div>

                        {/* Guidance */}
                        <div className="rounded-[10px] bg-background border p-4">
                          <p className="label-text mb-1">WHAT TO DO</p>
                          <p className="text-[15px] text-muted-foreground leading-relaxed">{scan.guidance}</p>
                        </div>

                        {/* Status picker */}
                        <div>
                          <p className="label-text mb-2">HOW ARE THINGS NOW?</p>

                          <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map(opt => (
                              <button
                                key={opt.value}
                                onClick={() => handleStatusChange(scan.id, opt.value)}
                                disabled={updatingStatus === scan.id}
                                className={`rounded-[20px] border px-3 py-1 text-sm transition-colors ${
                                  scan.status === opt.value
                                    ? "bg-primary text-primary-foreground border-transparent"
                                    : "bg-background text-secondary-foreground border-border hover:bg-accent"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                          {scan.status_updated_at && scan.status !== "watching" && (
                            <p className="text-[11px] text-hint mt-1">
                              Updated {formatDistanceToNow(new Date(scan.status_updated_at), { addSuffix: true })}
                            </p>
                          )}
                        </div>

                        {/* Notes */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="label-text">YOUR NOTES</p>
                            <button
                              onClick={() => setAddingNoteTo(addingNoteTo === scan.id ? null : scan.id)}
                              className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                              Add note
                            </button>
                          </div>

                          {noteCount === 0 && addingNoteTo !== scan.id && (
                            <p className="text-[15px] text-hint">No notes yet.</p>
                          )}

                          {scan.scan_notes
                            ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .map(note => (
                              <div key={note.id} className="mb-2 rounded-[10px] bg-background border p-3">
                                <p className="text-[15px] text-foreground leading-relaxed">{note.note_text}</p>
                                <p className="text-[11px] text-hint mt-1">
                                  {format(new Date(note.created_at), "MMM d, yyyy")}
                                </p>
                              </div>
                            ))}

                          {addingNoteTo === scan.id && (
                            <div className="mt-2 space-y-2">
                              <Textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="What have you noticed since?"
                                className="min-h-[80px] text-[17px]"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAddNote(scan.id)}
                                  disabled={!noteText.trim() || savingNote}
                                >
                                  {savingNote ? "Saving…" : "Save note"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => { setAddingNoteTo(null); setNoteText(""); }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Concern areas */}
                        {scan.concern_areas && scan.concern_areas.length > 0 && (
                          <div>
                            <p className="label-text mb-2">ORIGINAL CONCERNS</p>
                            <div className="flex flex-wrap gap-1.5">
                              {scan.concern_areas.map((c, i) => (
                                <Badge key={i} variant="chip" className="text-[11px]">{c}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
