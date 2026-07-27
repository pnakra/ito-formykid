import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Shield, MessageCircle, Eye } from "lucide-react";

export function Header({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
        <Link to="/" className="text-[18px] font-medium text-foreground">
          is this ok?
        </Link>
        <nav className="flex items-center gap-1">
          {isLoggedIn ? (
            <>
              <Link to="/home" search={{ tab: "understand" }}>
                <Button variant="ghost" size="sm" className="text-[15px]">Understand now</Button>
              </Link>
              <Link to="/home" search={{ tab: "stay_ahead" }}>
                <Button variant="ghost" size="sm" className="text-[15px]">Stay ahead</Button>
              </Link>
              <Link to="/history">
                <Button variant="ghost" size="sm" className="text-[15px]">History</Button>
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
    <div className="rounded-[14px] border bg-card p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent">
        <Icon className="h-4 w-4 text-foreground" />
      </div>
      <h3 className="mb-1 text-[18px] font-medium text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
