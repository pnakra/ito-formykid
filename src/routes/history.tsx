import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { track } from "@/lib/track";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Saved — is this ok for my kid?" },
      { name: "description", content: "Checks you chose to save. Only you can see them." },
      { property: "og:title", content: "Saved — is this ok for my kid?" },
      { property: "og:description", content: "Checks you chose to save. Only you can see them." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SavedPage,
});

const NOTE_MAX = 500;

interface SavedItem {
  id: string;
  input_content: string;
  note: string | null;
  created_at: string;
}

function SavedPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [user, authLoading, navigate]);

  const load = async () => {
    const { data } = await supabase
      .from("scans")
      .select("id, input_content, note, created_at")
      .order("created_at", { ascending: false });
    setItems((data as SavedItem[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const saveNote = async (id: string) => {
    setBusy(true);
    const note = draft.trim().slice(0, NOTE_MAX) || null;
    await supabase.from("scans").update({ note } as any).eq("id", id);
    setEditingId(null);
    setBusy(false);
    await load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this saved item and its note? This can't be undone.")) return;
    setBusy(true);
    await supabase.from("scans").delete().eq("id", id);
    track("result_deleted");
    setBusy(false);
    await load();
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={true} />
      <main className="flex-1 py-10">
        <div className="mx-auto max-w-[34rem] px-5">
          <h1 className="font-display text-[32px] font-bold text-foreground mb-2">Saved</h1>
          <p className="text-[18px] text-hint mb-6">Only you can see these.</p>

          {loading ? (
            <p className="text-hint">Loading.</p>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-border/80 bg-card p-5 text-center">
              <p className="text-[17px] text-hint">Nothing saved yet.</p>
              <Link to="/scan">
                <Button size="sm" className="mt-3">Check something</Button>
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => {
                const firstLine = item.input_content.split("\n")[0].trim() || "Saved check";
                return (
                  <li key={item.id} className="rounded-2xl border border-border/80 bg-card p-4 space-y-3">
                    <div>
                      <p className="text-[13px] text-hint">{format(new Date(item.created_at), "MMM d, yyyy")}</p>
                      <p className="text-[18px] text-foreground truncate">{firstLine}</p>
                    </div>

                    {editingId === item.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={draft}
                          maxLength={NOTE_MAX}
                          onChange={(e) => setDraft(e.target.value)}
                          placeholder="A private note for yourself"
                          className="min-h-[70px] bg-background"
                        />
                        <p className="text-[12px] text-hint">{draft.length} / {NOTE_MAX}</p>
                        <div className="flex gap-2">
                          <Button size="sm" disabled={busy} onClick={() => saveNote(item.id)}>Save note</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {item.note && (
                          <p className="text-[15px] text-muted-foreground pl-3 border-l-2 border-border whitespace-pre-wrap">{item.note}</p>
                        )}
                        <div className="flex gap-4">
                          <button
                            className="text-[14px] text-hint hover:text-foreground underline underline-offset-4"
                            onClick={() => { setEditingId(item.id); setDraft(item.note ?? ""); }}
                          >
                            {item.note ? "Edit note" : "Add a note"}
                          </button>
                          <button
                            className="text-[14px] text-error hover:underline underline-offset-4"
                            disabled={busy}
                            onClick={() => remove(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
