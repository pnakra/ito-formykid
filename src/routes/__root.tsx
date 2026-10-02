import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/hooks/useAuth";
import { enforceAccess } from "@/lib/accessGate";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  beforeLoad: ({ location }) =>
    enforceAccess(
      location.pathname,
      location.search as Record<string, unknown>,
      location.href,
    ),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "is this ok for my kid? — understand what your child sees online" },
      { name: "description", content: "A calm orientation tool helping parents of kids 10 to 18 understand harmful online content and how to talk about it." },
      { name: "author", content: "is this ok for my kid?" },
      { property: "og:title", content: "is this ok for my kid? — understand what your child sees online" },
      { property: "og:description", content: "A calm orientation tool helping parents of kids 10 to 18 understand harmful online content and how to talk about it." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "is this ok for my kid? — understand what your child sees online" },
      { name: "twitter:description", content: "A calm orientation tool helping parents of kids 10 to 18 understand harmful online content and how to talk about it." },
      { property: "og:image", content: "https://formykid.isthisok.app/og-image.png" },
      { name: "twitter:image", content: "https://formykid.isthisok.app/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "google-site-verification", content: "xr4x5H9hV0dwQOnoNptKRvSN5Nl2ae837bV20FyqKIs" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap",
      },

      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
