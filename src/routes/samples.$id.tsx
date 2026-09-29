import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { getSample } from "@/content/samples";
import { ReportV2 } from "@/components/ReportV2";
import { SafetyHelpBlock } from "@/components/SafetyHelpBlock";
import { FeedbackBox } from "@/components/FeedbackBox";
import { isSafetyCategory } from "@/content/safetyCopy";
import { track } from "@/lib/track";

export const Route = createFileRoute("/samples/$id")({
  loader: ({ params }) => {
    const sample = getSample(params.id);
    if (!sample) throw notFound();
    return { sample };
  },
  head: () => ({
    meta: [
      { title: "Sample result — is this ok for my kid?" },
      { name: "description", content: "A made-up situation and the answer the tool gives." },
      { property: "og:title", content: "Sample result — is this ok for my kid?" },
      { property: "og:description", content: "A made-up situation and the answer the tool gives." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  notFoundComponent: () => (
    <div className="p-10 text-center text-foreground">
      That sample doesn't exist. <Link to="/samples" className="text-primary underline">See all samples</Link>
    </div>
  ),
  errorComponent: () => <div className="p-10 text-center text-foreground">Something went wrong.</div>,
  component: SamplePage,
});

function SamplePage() {
  const { user } = useAuth();
  const { sample } = Route.useLoaderData();
  const r = sample.result;
  const cat = isSafetyCategory(r.safety_category) ? r.safety_category : null;

  useEffect(() => {
    track("sample_opened", { sample_id: sample.id });
    track("result_viewed", {
      in_scope: r.in_scope, safety_category: cat, recognized: r.recognized,
      lens_keys: r.lenses.map((l) => l.key), latency_ms: 0, is_sample: true,
    });
  }, [sample.id]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isLoggedIn={!!user} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-10 pb-16">
        <p className="label-text text-hint mb-3">Sample situation. Made up for practice.</p>
        <p className="mb-8 text-[18px] italic leading-[1.55] text-muted-foreground">"{sample.scenario}"</p>
        {cat && <div className="mb-8"><SafetyHelpBlock category={cat} /></div>}
        <ReportV2
          result={r}
          actions={
            <div className="space-y-7">
              <FeedbackBox inScope={r.in_scope} safetyCategory={cat} sampleId={sample.id} />
              <Link to="/samples" className="text-[16px] text-primary underline underline-offset-4">See other samples</Link>
            </div>
          }
        />
      </main>
      <Footer />
    </div>
  );
}
