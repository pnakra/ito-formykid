import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account — is this ok?" },
      { name: "description", content: "Manage your is this ok? account and subscription." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [scanCount, setScanCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("scan_count, is_subscribed")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setScanCount(data.scan_count);
            setIsSubscribed(data.is_subscribed);
          }
        });
    }
  }, [user]);

  if (authLoading) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={true} />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-xl px-5">
          <h1 className="text-2xl font-medium text-foreground mb-6">
            Account
          </h1>

          <div className="space-y-4">
            {/* Email */}
            <div className="rounded-[14px] border bg-card p-5">
              <p className="label-text mb-1">Email</p>
              <p className="text-[15px] text-foreground">{user?.email}</p>
            </div>

            {/* Usage */}
            <div className="rounded-[14px] border bg-card p-5">
              <p className="label-text mb-1">Usage</p>
              <p className="text-[15px] text-foreground">
                {scanCount} scan{scanCount === 1 ? "" : "s"} completed
              </p>
              {!isSubscribed && (
                <p className="text-sm text-muted-foreground mt-1">
                  {scanCount < 3
                    ? `${3 - scanCount} free scan${3 - scanCount === 1 ? "" : "s"} remaining`
                    : "Free scans used up"}
                </p>
              )}
            </div>

            {/* Subscription */}
            <div className="rounded-[14px] border bg-card p-5">
              <p className="label-text mb-1">Subscription</p>
              {isSubscribed ? (
                <div>
                  <p className="text-[15px] text-foreground">Active — $9/month</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Unlimited scans included.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-[15px] text-foreground mb-3">No active subscription</p>
                  <Button size="sm">
                    Subscribe — $9/month
                  </Button>
                  <p className="text-xs text-hint mt-2">
                    Unlimited scans. Cancel anytime.
                  </p>
                </div>
              )}
            </div>

            {/* Sign out */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
