import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { deleteMyAccount } from "@/lib/account.functions";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account — is this ok?" },
      { name: "description", content: "Manage your account, saved reports, and monthly digest settings." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<{
    email: string;
    digest_enabled: boolean;
    digest_age_group: string | null;
  } | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const deleteAccount = useServerFn(deleteMyAccount);

  const handleDeleteAccount = async () => {
    if (!window.confirm("Delete your account and everything you saved? This can't be undone.")) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteAccount();
      await supabase.auth.signOut();
      navigate({ to: "/" });
    } catch {
      setDeleteError("We couldn't delete your account. Please try again.");
      setDeleting(false);
    }
  };

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

  }, [user]);

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

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={true} />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-[34rem] px-5 space-y-10">

          {/* ─── Account ─── */}
          <section>
            <h1 className="font-display text-[32px] font-bold text-foreground mb-4">Account</h1>
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4">
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
            <h2 className="font-display text-[22px] font-medium text-foreground mb-3">Monthly email</h2>
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[18px] text-foreground">Send me a monthly email</p>
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

              <p className="text-[13px] text-hint">One email a month.</p>
            </div>
          </section>

          {/* ─── Saved + delete ─── */}
          <section>
            <h2 className="font-display text-[22px] font-medium text-foreground mb-3">Your data</h2>
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4">
              <Link to="/history" className="text-[17px] text-primary underline underline-offset-4">
                See what you saved
              </Link>
              <p className="text-[15px] text-hint">Checks you don't save are not stored.</p>
              <Button variant="outline" className="w-full text-error" disabled={deleting} onClick={handleDeleteAccount}>
                {deleting ? "Deleting…" : "Delete my account and data"}
              </Button>
              {deleteError && <p className="text-[15px] text-error">{deleteError}</p>}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
