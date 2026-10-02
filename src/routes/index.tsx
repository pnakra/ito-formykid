import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, Heart, HandHeart, Menu, MessageCircleMore, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import heroImage from "@/assets/home-hero.jpg";
import questionsImage from "@/assets/home-questions.jpg";

const title = "is this ok for my kid? — A calmer way to make sense of what kids find online";
const description = "A free nonprofit tool for parents. Understand what you noticed, consider three important safety questions, and find a good way to talk about it.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
});

const questions = [
  {
    icon: ShieldCheck,
    title: "Is my kid being harmed?",
    detail: "Could someone be hurting, pressuring, or taking advantage of them? We take that possibility seriously without assuming the worst.",
  },
  {
    icon: HandHeart,
    title: "Is my kid harming someone else?",
    detail: "This can be hard to ask. Kids can repeat a joke, share a post, or join in before they understand the harm. Looking honestly helps you guide them, not label them.",
  },
  {
    icon: Heart,
    title: "Is my kid harming themselves?",
    detail: "Could what they are seeing or doing be hurting their own wellbeing? We help you notice the difference between a passing moment and something that needs care.",
  },
];

function HomePage() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sections = document.querySelectorAll<HTMLElement>("[data-scroll-reveal]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("scroll-reveal-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px 60px 0px" });
    sections.forEach((section) => {
      section.classList.add("scroll-reveal-ready");
      observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="relative z-20 border-b border-border bg-background">
        <nav aria-label="Main navigation" className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-5 py-3 md:px-8">
          <Link to="/" className="font-display text-[18px] font-bold leading-tight text-foreground sm:text-[21px]">is this ok for my kid?</Link>
          <div className="hidden shrink-0 items-center gap-5 sm:flex">
            <Link to="/why" className="text-[15px] text-muted-foreground transition-colors hover:text-foreground">Why this exists</Link>
            <Link to="/login" className="text-[15px] text-muted-foreground transition-colors hover:text-foreground">Sign in</Link>
            <Button asChild size="sm" className="h-10 px-5 text-[15px]"><Link to="/scan">Try it <ArrowRight aria-hidden="true" /></Link></Button>
          </div>
          <div className="sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetTitle className="font-display text-[16px]">Menu</SheetTitle>
                <div className="mt-4 flex flex-col gap-1">
                  <SheetClose asChild>
                    <Link to="/why"><Button variant="ghost" className="w-full justify-start">Why this exists</Button></Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/login"><Button variant="ghost" className="w-full justify-start">Sign in</Button></Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/scan"><Button className="w-full justify-start">Try it</Button></Link>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative isolate flex flex-col overflow-hidden bg-background md:min-h-[650px] lg:min-h-[700px]" aria-labelledby="home-title">
          <img src={heroImage} alt="A hand-drawn map with a winding path and symbols of care and conversation" width={1600} height={1008} className="order-2 h-[280px] w-full object-cover object-right md:absolute md:inset-0 md:order-none md:h-full md:object-center" fetchPriority="high" />
          <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col justify-start px-5 pb-8 pt-10 md:justify-center md:px-8 md:pb-24 md:pt-10">
            <div className="max-w-[550px] animate-fade-in">
              <p className="mb-5 font-display text-[14px] font-medium uppercase text-primary"></p>
              <h1 id="home-title" className="max-w-[570px] font-display text-[38px] font-medium leading-[1.1] text-foreground sm:text-[48px] lg:text-[60px]">A little clarity goes a long way.</h1>
              <p className="mt-6 max-w-[470px] text-[18px] leading-[1.55] text-muted-foreground md:text-[20px]">A calm place to make sense of something your kid said, saw, or did online — and decide what to say next.</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="h-12 px-7 text-[17px]"><Link to="/scan">Try it <ArrowRight aria-hidden="true" /></Link></Button>
                <span className="text-[15px] text-muted-foreground">Free. No account needed.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-card py-16 md:py-24" aria-labelledby="intro-title">
          <div data-scroll-reveal className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-20 md:px-8">
            <div>
              <p className="label-text mb-5">WHAT THIS IS</p>
              <h2 id="intro-title" className="max-w-[530px] font-display text-[32px] leading-[1.18] md:text-[43px]">Understanding instead of guessing. Learning instead of ignoring.</h2>
            </div>
            <div className="space-y-5 text-[18px] leading-[1.65] text-muted-foreground md:pt-8">
              <p>Maybe it’s a phrase you keep hearing. A creator they follow. A message in a group chat. Or a change you can’t quite put into words.</p>
              <p>Tell us what you noticed, or look up a term. We explain it in plain language, say what we can and can’t tell from the details, and offer a way to start a conversation.</p>
              <p className="font-medium text-foreground">No monitoring. No verdict on your kid or you as a parent. Just a place to begin.</p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24" aria-labelledby="questions-title">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div data-scroll-reveal className="grid items-end gap-8 md:grid-cols-[1fr_1.05fr] md:gap-14">
              <div>
                <p className="label-text mb-5">THE QUESTIONS BEHIND EVERY ANSWER</p>
                <h2 id="questions-title" className="max-w-[540px] font-display text-[32px] leading-[1.18] md:text-[43px]">Three fundamental questions behind every read.</h2>
                <p className="mt-5 max-w-[520px] text-[18px] leading-[1.6] text-muted-foreground">It’s natural to think first about what could happen to your child. But a fuller picture also asks whether they might be hurting someone else, or themselves. We hold all three with care, not blame.</p>
              </div>
              <img src={questionsImage} alt="Three hand-drawn symbols of care, conversation, and wellbeing" width={1408} height={864} loading="lazy" className="w-full max-h-[360px] object-cover" />
            </div>
            <div className="mt-10 grid gap-0 border-t border-border md:mt-16 md:grid-cols-3 md:gap-8">
              {questions.map((question) => {
                const Icon = question.icon;
                return (
                  <article key={question.title} data-scroll-reveal className="border-b border-border py-7 md:border-b-0 md:py-8">
                    <Icon aria-hidden="true" strokeWidth={1.5} className="mb-6 h-9 w-9 text-primary" />
                    <h3 className="max-w-[320px] font-display text-[24px] leading-[1.25] md:text-[27px]">{question.title}</h3>
                    <p className="mt-4 text-[17px] leading-[1.65] text-muted-foreground">{question.detail}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card py-16 md:py-24" aria-labelledby="how-title">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div data-scroll-reveal className="max-w-2xl">
              <p className="label-text mb-5">HOW IT WORKS</p>
              <h2 id="how-title" className="font-display text-[32px] leading-[1.18] md:text-[43px]">From “what is this?” to “what do I do?”</h2>
            </div>
            <div className="mt-10 grid gap-0 md:mt-14 md:grid-cols-3 md:gap-10">
              <div data-scroll-reveal className="border-t border-border py-7">
                <Search aria-hidden="true" strokeWidth={1.5} className="mb-5 h-8 w-8 text-primary" />
                <h3 className="font-display text-[23px]">Tell us what you noticed</h3>
                <p className="mt-3 text-[17px] leading-[1.6] text-muted-foreground">Write a few words about a moment, or look up a term, creator, game, or community.</p>
              </div>
              <div data-scroll-reveal className="border-t border-border py-7">
                <Sparkles aria-hidden="true" strokeWidth={1.5} className="mb-5 h-8 w-8 text-primary" />
                <h3 className="font-display text-[23px]">Add detail if you want</h3>
                <p className="mt-3 text-[17px] leading-[1.6] text-muted-foreground">A few optional questions help us be more specific. Skip them if you’d rather get straight to the answer.</p>
              </div>
              <div data-scroll-reveal className="border-t border-border py-7">
                <MessageCircleMore aria-hidden="true" strokeWidth={1.5} className="mb-5 h-8 w-8 text-primary" />
                <h3 className="font-display text-[23px]">Get a place to start</h3>
                <p className="mt-3 text-[17px] leading-[1.6] text-muted-foreground">Read what it may mean, why it matters, one next step, and a way to bring it up.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24" aria-labelledby="why-title">
          <div data-scroll-reveal className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-[0.7fr_1fr] md:gap-24 md:px-8">
            <div>
              <p className="label-text mb-5">WHY WE BUILT IT</p>
              <h2 id="why-title" className="font-display text-[32px] leading-[1.18] md:text-[43px]">Parents need context, not another alarm.</h2>
            </div>
            <div className="space-y-5 text-[18px] leading-[1.65] text-muted-foreground md:pt-8">
              <p>Online life is part of growing up. Sometimes it’s funny or confusing. Sometimes someone really does need help. It can be hard to tell which is which from one word, one video, or one conversation.</p>
              <p>We built this at Override Labs, a nonprofit, to make that first moment less lonely. We won’t pretend to know your child from a few lines of text. We’ll give you context, name uncertainty, and help you take a thoughtful next step.</p>
              <Link to="/why" className="inline-flex items-center gap-2 font-medium text-primary underline underline-offset-4 hover:text-foreground">More about why this exists <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-secondary py-16 md:py-24" aria-labelledby="try-title">
          <div data-scroll-reveal className="mx-auto max-w-6xl px-5 md:px-8">
            <p className="label-text mb-5">WHEN YOU’RE READY</p>
            <h2 id="try-title" className="max-w-[740px] font-display text-[34px] leading-[1.17] md:text-[48px]">You don’t need the right words to get started.</h2>
            <p className="mt-5 max-w-[600px] text-[18px] leading-[1.6] text-muted-foreground">Start with what you’ve noticed. You can keep it brief, and leave out names or private details.</p>
            <Button asChild size="lg" className="mt-8 h-12 px-7 text-[17px]"><Link to="/scan">Try a lookup <ArrowRight aria-hidden="true" /></Link></Button>
            <p className="mt-4 text-[15px] text-muted-foreground">Free, unlimited, and no account needed.</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-9">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 text-[15px] text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <div><p className="font-display font-medium text-foreground">is this ok for my kid?</p><p>Built by a nonprofit focused on preventing sexual violence. Those are the questions we know best.</p></div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/why" className="hover:text-foreground">Why this exists</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/login" className="hover:text-foreground">Sign in</Link>
            <a href="https://isthisok.app" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">isthisok.app</a>
          </div>
        </div>
      </footer>
    </div>
  );
}