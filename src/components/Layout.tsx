import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Shield, MessageCircle, Eye } from "lucide-react";

export function Header({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
        <Link to="/" className="text-[15px] font-medium text-foreground">
          is this ok?
        </Link>
        <nav className="flex items-center gap-1">
          {isLoggedIn ? (
            <>
              <Link to="/home" search={{ tab: "understand" }}>
                <Button variant="ghost" size="sm" className="text-[13px]">Understand now</Button>
              </Link>
              <Link to="/home" search={{ tab: "stay_ahead" }}>
                <Button variant="ghost" size="sm" className="text-[13px]">Stay ahead</Button>
              </Link>
              <Link to="/history">
                <Button variant="ghost" size="sm" className="text-[13px]">History</Button>
              </Link>
              <Link to="/account">
                <Button variant="ghost" size="sm" className="text-[13px]">Account</Button>
              </Link>
            </>
          ) : (
            <>
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
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">
            is this ok? for my kid — a companion to{" "}
            <a
              href="https://isthisok.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4"
            >
              isthisok.app
            </a>
          </p>
          <p className="text-xs text-hint">
            A nonprofit orientation tool — not a monitoring tool.
          </p>
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
    <div className="rounded-[14px] border bg-card p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent">
        <Icon className="h-4 w-4 text-foreground" />
      </div>
      <h3 className="mb-1 text-[15px] font-medium text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
