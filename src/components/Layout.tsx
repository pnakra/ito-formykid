import { track } from "@/lib/track";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Shield, MessageCircle, Eye, Menu } from "lucide-react";
import { useState } from "react";
import { useIsStudy } from "@/lib/entrySource";
import { STAY_AHEAD_ENABLED } from "@/config/features";
import { StudyTasks } from "@/components/StudyTasks";

type NavItem = { to: string; label: string; primary?: boolean; search?: Record<string, string> };

export function Header({ isLoggedIn, study }: { isLoggedIn: boolean; study?: boolean }) {
  const storedStudy = useIsStudy();
  const isStudy = study ?? storedStudy;
  const [menuOpen, setMenuOpen] = useState(false);

  const items: NavItem[] = isStudy
    ? [{ to: "/study/done", label: "Finish study", primary: true }]
    : isLoggedIn
      ? [
          { to: "/home", label: "Understand now", search: { tab: "understand" } },
          ...(STAY_AHEAD_ENABLED ? [{ to: "/home", label: "Stay ahead", search: { tab: "stay_ahead" } }] : []),
          { to: "/history", label: "Saved" },
          { to: "/account", label: "Account" },
        ]
      : [
          { to: "/why", label: "Why this exists" },
          { to: "/login", label: "Log in" },
          { to: "/signup", label: "Get started", primary: true },
        ];

  return (
    <>
    <header className="border-b bg-background">
      <div className="mx-auto flex min-h-14 max-w-3xl items-center justify-between gap-3 px-5 py-2">
        <Link to={isStudy ? "/start" : "/"} className="min-w-0 font-display text-[18px] font-semibold text-foreground">
          is this ok for my kid?
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          <Link to="/help" onClick={() => track("get_help_clicked", { page: typeof window !== "undefined" ? window.location.pathname : "" })}>
            <Button variant="ghost" size="sm">Get help</Button>
          </Link>
          {items.map((item) => (
            <Link key={item.label} to={item.to} search={item.search}>
              <Button variant={item.primary ? "default" : "ghost"} size="sm">{item.label}</Button>
            </Link>
          ))}
        </nav>

        {/* Mobile: side menu */}
        <div className="sm:hidden">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetTitle className="font-display text-[16px]">Menu</SheetTitle>
              <nav className="mt-4 flex flex-col gap-1">
                <Link
                  to="/help"
                  onClick={() => {
                    track("get_help_clicked", { page: typeof window !== "undefined" ? window.location.pathname : "" });
                    setMenuOpen(false);
                  }}
                >
                  <Button variant="ghost" className="w-full justify-start">Get help</Button>
                </Link>
                {items.map((item) => (
                  <Link key={item.label} to={item.to} search={item.search} onClick={() => setMenuOpen(false)}>
                    <Button variant={item.primary ? "default" : "ghost"} className="w-full justify-start">{item.label}</Button>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
    {isStudy && <StudyTasks />}
    </>
  );
}

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto max-w-3xl px-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-[18px] text-hint">
            Built by a nonprofit focused on preventing sexual violence. Those are the questions we know best.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[18px] text-hint">
            <Link
              to="/why"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Why this exists
            </Link>
            <Link
              to="/privacy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Privacy
            </Link>
            <a
              href="https://isthisok.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              isthisok.app
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Shield;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent">
        <Icon className="h-4 w-4 text-foreground" />
      </div>
      <h3 className="mb-1 font-display text-[18px] font-medium text-foreground">{title}</h3>
      <p className="text-[18px] leading-relaxed text-hint">{description}</p>
    </div>
  );
}
