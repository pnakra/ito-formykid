import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { unlockSite } from "@/lib/earlyAccess.functions";
import { markUnlocked } from "@/lib/accessGate";

export const Route = createFileRoute("/unlock")({
  head: () => ({
    meta: [
      { title: "Team access — is this ok?" },
      { name: "description", content: "Password access for the is this ok? team." },
      { property: "og:title", content: "Team access — is this ok?" },
      { property: "og:description", content: "Password access for the is this ok? team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UnlockPage,
});

function UnlockPage() {
  const unlock = useServerFn(unlockSite);
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await unlock({ data: { password: pw } });
    setLoading(false);
    if (res.ok) {
      markUnlocked();
      navigate({ to: "/" });
    } else setError("That password didn't work.");
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-background px-5 pt-[18vh]">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <h1 className="text-[26px] text-foreground" style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}>
          Team access
        </h1>
        <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" className="h-12 text-[18px]" autoFocus />
        {error && <p className="text-[15px] text-destructive">{error}</p>}
        <Button type="submit" disabled={loading || !pw} className="w-full h-12">
          {loading ? "Checking…" : "Enter"}
        </Button>
      </form>
    </div>
  );
}
