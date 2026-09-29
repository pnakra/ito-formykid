import { track } from "@/lib/track";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Shield, MessageCircle, Eye } from "lucide-react";
import { useIsStudy } from "@/lib/entrySource";
import { STAY_AHEAD_ENABLED } from "@/config/features";

export function Header({ isLoggedIn, study }: { isLoggedIn: boolean; study?: boolean }) {
  const storedStudy = useIsStudy();
  const isStudy = study ?? storedStudy;
  return (
    <header className="border-b bg-background">
      <div className={`mx-auto flex min-h-14 max-w-3xl items-center justify-between gap-2 px-5 py-2 ${isLoggedIn && !isStudy ? "flex-wrap sm:flex-nowrap" : ""}`}>
        <Link to={isStudy ? "/start" : "/"} className="shrink-0 font-display text-[18px] font-semibold text-foreground">
          is this ok?
        </Link>
        <nav className={`flex items-center gap-1 ${isLoggedIn && !isStudy ? "w-full flex-wrap sm:w-auto" : ""}`}>
          <Link to="/help" onClick={() => track("get_help_clicked", { page: typeof window !== "undefined" ? window.location.pathname : "" })}>
            <Button variant="ghost" size="sm" className="text-[15px]">Get help</Button>
          </Link>
          {isStudy ? (
            <Link to="/study/done">
              <Button size="sm">Finish study</Button>
            </Link>
          ) : isLoggedIn ? (
            <>
              <Link to="/home" search={{ tab: "understand" }}>
                <Button variant="ghost" size="sm" className="text-[15px]">Understand now</Button>
              </Link>
              {STAY_AHEAD_ENABLED && <Link to="/home" search={{ tab: "stay_ahead" }}>
                <Button variant="ghost" size="sm" className="text-[15px]">Stay ahead</Button>
              </Link>}
              <Link to="/history">
                <Button variant="ghost" size="sm" className="text-[15px]">Saved</Button>
              </Link>
              <Link to="/account">
                <Button variant="ghost" size="sm" className="text-[15px]">Account</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/why">
                <Button variant="ghost" size="sm">Why this?</Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto max-w-3xl px-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-[15px] text-hint">
            Free. Built by a nonprofit. We never see your child's phone.
          </p>
          <div className="flex items-center gap-4 text-[15px] text-hint">
            <Link
              to="/why"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Why this?
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
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
