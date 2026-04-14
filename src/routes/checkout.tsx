import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header, Footer } from "@/components/Layout";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Subscribe — is this ok?" },
      { name: "description", content: "Subscribe to is this ok? for parents — ongoing support, saved reports, and monthly briefings." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <PaymentTestModeBanner />
      <Header isLoggedIn={true} />
      <main className="flex-1 py-10">
        <div className="mx-auto max-w-xl px-5">
          <h1 className="text-2xl font-medium text-foreground mb-1">
            Ongoing support for parents
          </h1>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            $9/month. Cancel anytime. Made by a nonprofit — no ads, no data selling, no surveillance.
          </p>
          <ul className="text-sm text-muted-foreground mb-6 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />Look up anything — creators, terms, games, behaviors — as often as you need</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />Save reports and add your own notes over time</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />Track situations and see patterns across observations</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />Monthly briefings tailored to your child's age group</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />Guidance on the protective factors that research shows matter most</li>
          </ul>
          <StripeEmbeddedCheckout
            priceId="parents_monthly_price"
            quantity={1}
            customerEmail={user.email ?? undefined}
            userId={user.id}
            returnUrl={`${window.location.origin}/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
