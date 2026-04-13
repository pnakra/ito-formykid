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
      { name: "description", content: "Subscribe to is this ok? for parents for unlimited content scans." },
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
            Subscribe
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Unlimited scans for $9/month. Cancel anytime.
          </p>
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
