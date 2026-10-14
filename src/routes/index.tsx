import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Brain, Repeat, ScanLine, ShieldCheck, Workflow, BarChart3, ArrowRight, Menu, X, ChevronDown, Eye, Sparkles, Boxes } from "lucide-react";
import { Logo } from "@/components/eco/Logo";
import { NAV } from "@/components/eco/nav";
import { Bin } from "@/components/eco/Bin";
import { Button } from "@/components/ui/button";
import { BIN_CATEGORIES } from "@/lib/categories";
import { binCounts, useStore } from "@/lib/store";
import hero from "@/assets/hero.jpg";
import bins from "@/assets/bins.jpg";
import circular from "@/assets/circular.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EcoTwin AI — See the waste. Recycle smarter." },
      { name: "description", content: "AI waste recognition, recycling guidance and a living digital twin of your bins." },
      { property: "og:title", content: "EcoTwin AI — Smart Recycling Assistant" },
      { property: "og:description", content: "See the waste. Understand the impact. Recycle smarter." },
    ],
  }),
  component: Home,
});

function Home() {
  const [open, setOpen] = useState(false);
  const store = useStore();
  const counts = binCounts(store);
  const confirmed = store.scans.filter((s) => s.confirmedCategory).length;
  const cats = new Set(store.scans.filter((s) => s.confirmedCategory).map((s) => s.confirmedCategory)).size;

  return (
    <div>
      {/* HERO */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
        <div className="absolute inset-0 -z-10" aria-hidden>
          <img src={hero} alt="" width={1920} height={1088} className="h-full w-full object-cover animate-kenburns" />
          <div className="absolute inset-0 bg-overlay-hero" />
        </div>
        <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center gap-6 px-4 py-5 sm:px-8">
          <Logo />
          <nav className="ml-auto hidden items-center gap-6 text-sm font-medium xl:flex" aria-label="Main">
            {NAV.slice(0, 6).map((n) => <Link key={n.to} to={n.to} className="text-muted-foreground transition-colors hover:text-foreground text-hero-shadow" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }}>{n.label}</Link>)}
          </nav>
          <Button variant="hero" asChild className="ml-auto hidden sm:inline-flex xl:ml-0"><Link to="/scanner">Start Scanning</Link></Button>
          <Button variant="glass" size="icon" className="ml-auto sm:ml-0 xl:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</Button>
        </header>
        {open && (
          <div className="glass relative z-20 mx-4 rounded-2xl p-3 xl:hidden">
            {NAV.map((n) => <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-accent"><n.icon className="h-4 w-4 text-primary" />{n.label}</Link>)}
          </div>
        )}

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 pb-24 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary text-hero-shadow">Intelligent recycling • Powered by AI</p>
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-hero-shadow sm:text-7xl lg:text-8xl">
            See the waste.<br />Understand the impact.<br /><span className="text-gradient-brand">Recycle smarter.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-foreground/85 text-hero-shadow">Your intelligent recycling companion. Recognize materials, discover better ways to reuse them, and watch your environmental impact unfold through a living digital twin.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="hero" size="lg" asChild><Link to="/scanner"><ScanLine /> Scan Your First Item</Link></Button>
            <Button variant="glass" size="lg" asChild><Link to="/digital-twin">Explore the Digital Twin <ArrowRight /></Link></Button>
          </div>
          <p className="mt-8 flex flex-wrap gap-x-3 text-sm font-semibold text-muted-foreground text-hero-shadow">
            <span className="flex items-center gap-1.5"><Eye className="h-4 w-4 text-primary" />Computer Vision</span>·
            <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-lime" />Generative AI</span>·
            <span className="flex items-center gap-1.5"><Boxes className="h-4 w-4 text-primary" />Digital Twin</span>
          </p>
        </div>
        <a href="#how" className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 animate-floaty text-muted-foreground" aria-label="Scroll down"><ChevronDown className="h-7 w-7" /></a>
      </section>

      <main className="mx-auto max-w-7xl space-y-28 px-4 py-24 sm:px-8">
        {/* HOW */}
        <section id="how">
          <SectionHead eyebrow="How it works" title="Three steps from bin to insight." />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { i: Camera, t: "Capture", d: "Upload a photo or use your front or back camera — one item or many." },
              { i: Brain, t: "Understand", d: "A vision AI model predicts the material and explains how to handle it." },
              { i: Repeat, t: "Transform", d: "Confirm the result and watch the matching Digital Twin bin fill up." },
            ].map((s, n) => (
              <div key={s.t} className="glass relative rounded-3xl p-6 transition-transform hover:-translate-y-1">
                <span className="text-6xl font-extrabold text-primary/15">0{n + 1}</span>
                <s.i className="mt-2 h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-bold">{s.t}</h3>
                <p className="mt-2 text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TWIN PREVIEW */}
        <section className="relative overflow-hidden rounded-[2rem] border">
          <img src={bins} alt="" loading="lazy" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-overlay-page" />
          <div className="relative grid gap-10 p-6 sm:p-12 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <SectionHead eyebrow="Live Digital Twin" title="Your bins, mirrored in real time." />
              <p className="mt-4 text-muted-foreground text-hero-shadow">Each confirmed scan fills a virtual bin. At 80% you get a warning chime; when full, an alarm sounds with a notification.</p>
              <Button variant="hero" className="mt-6" asChild><Link to="/digital-twin">Open full simulation <ArrowRight /></Link></Button>
            </div>
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
              {BIN_CATEGORIES.map((c) => <Bin key={c} cat={c} count={counts[c] ?? 0} compact />)}
            </div>
          </div>
        </section>

        {/* WHY */}
        <section>
          <SectionHead eyebrow="Why EcoTwin AI" title="Built for real-world sorting decisions." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { i: ScanLine, t: "Smart recognition", d: "Plastic, paper, glass, metal, organic, e-waste, textile and more." },
              { i: ShieldCheck, t: "Responsible guidance", d: "Cautious advice for hazardous items and reminders to check local rules." },
              { i: Workflow, t: "Circular material flow", d: "Identified → Confirmed → Sorted → Recovery pathway." },
              { i: BarChart3, t: "Impact tracking", d: "Charts and 30-day history built from your own records." },
            ].map((f) => (
              <div key={f.t} className="glass rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-glow">
                <f.i className="h-7 w-7 text-lime" />
                <h3 className="mt-4 font-bold">{f.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* IMPACT */}
        <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHead eyebrow="Impact explained" title="Honest numbers, from your own records." />
            <p className="mt-4 text-muted-foreground">We count what you actually confirm on this device. We never invent global statistics or carbon savings.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat v={store.ready ? store.scans.length : "—"} l="Scans on this device" />
            <Stat v={store.ready ? confirmed : "—"} l="Confirmed sorting actions" />
            <Stat v={store.ready ? cats : "—"} l="Categories handled" />
            <Stat v="Not configured" l="CO₂ estimate" small />
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden rounded-[2rem] border">
          <img src={circular} alt="" loading="lazy" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-overlay-page" />
          <div className="relative px-6 py-20 text-center sm:py-28">
            <h2 className="font-display text-4xl font-extrabold text-hero-shadow sm:text-6xl">Small actions. <span className="text-gradient-brand">Bigger impact.</span></h2>
            <Button variant="hero" size="lg" className="mt-8" asChild><Link to="/scanner">Start Recycling Smarter <ArrowRight /></Link></Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-8 md:grid-cols-3">
          <div><Logo /><p className="mt-3 text-sm text-muted-foreground">Helping people understand what happens to their waste — one confirmed decision at a time.</p></div>
          <nav className="grid grid-cols-2 gap-2 text-sm">{NAV.map((n) => <Link key={n.to} to={n.to} className="text-muted-foreground hover:text-foreground">{n.label}</Link>)}</nav>
          <p className="text-xs text-muted-foreground">Activity totals are measured from records on this device. Any environmental impact shown is an estimate, not a measured outcome. Sorting an item does not guarantee it was recycled.</p>
        </div>
      </footer>
    </div>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-hero-shadow sm:text-5xl">{title}</h2>
    </div>
  );
}
function Stat({ v, l, small }: { v: string | number; l: string; small?: boolean }) {
  return (
    <div className="glass rounded-3xl p-5">
      <p className={small ? "text-lg font-bold text-muted-foreground" : "text-4xl font-extrabold tabular-nums text-gradient-brand"}>{v}</p>
      <p className="mt-1 text-sm text-muted-foreground">{l}</p>
    </div>
  );
}
