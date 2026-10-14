import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Recycle, Repeat, Wrench, ShieldAlert, Boxes, Info, Sparkles } from "lucide-react";
import { AppShell, Panel } from "@/components/eco/AppShell";
import { CategoryChip } from "@/components/eco/CategoryChip";
import { Button } from "@/components/ui/button";
import { BIN_CATEGORIES, CAT, COMMON_ITEMS, GUIDE, type Category } from "@/lib/categories";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import circular from "@/assets/circular.jpg";

export const Route = createFileRoute("/recommendations")({
  validateSearch: (s: Record<string, unknown>): { scan?: string; cat?: string } => ({ ...(typeof s["scan"] === "string" ? { scan: s["scan"] } : {}), ...(typeof s["cat"] === "string" ? { cat: s["cat"] } : {}) }),
  head: () => ({
    meta: [
      { title: "Recycling Recommendations — EcoTwin AI" },
      { name: "description", content: "Practical guidance to reuse, sort and dispose of materials responsibly." },
      { property: "og:title", content: "Recycling Recommendations — EcoTwin AI" },
      { property: "og:description", content: "Make your next action count." },
    ],
  }),
  component: Recs,
});

function Recs() {
  const { scan, cat: catParam } = Route.useSearch();
  const store = useStore();
  const rec = scan ? store.scans.find((s) => s.id === scan) : undefined;
  const [pick, setPick] = useState<Category | null>(null);
  const [q, setQ] = useState("");
  const cat: Category = pick ?? rec?.confirmedCategory ?? rec?.result.category ?? ((BIN_CATEGORIES as string[]).includes(catParam ?? "") ? (catParam as Category) : "plastic");
  const matches = useMemo(() => q.trim() ? COMMON_ITEMS.filter((i) => i.name.toLowerCase().includes(q.toLowerCase())) : [], [q]);
  const g = GUIDE[cat];
  const showAi = rec && !pick;

  const sections = [
    { t: "Reuse", i: Repeat, xs: showAi ? rec.result.reuse : g.reuse, why: "Reuse keeps the item in use longest — the most valuable option." },
    { t: "Recycle", i: Recycle, xs: g.recycle, why: "Recycling recovers material when reuse isn't practical." },
    { t: "Prepare", i: Wrench, xs: showAi ? rec.result.preparation : g.prepare, why: "Clean, separated material is far more likely to be accepted." },
    { t: "Special disposal", i: ShieldAlert, xs: showAi ? [...rec.result.disposal, ...g.special] : g.special, why: "Some items are unsafe in ordinary bins." },
  ].filter((s) => s.xs.length);

  return (
    <AppShell title="Recommendations" image={circular} eyebrow="Generative guidance"
      heading={<>Make your next action <span className="text-gradient-brand">count.</span></>}
      description="Practical guidance to reuse, sort, and dispose of materials responsibly.">
      <Panel>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search common items</span>
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search an item, e.g. battery, pizza box…" className="h-12 w-full rounded-full border bg-background/40 pl-11 pr-4 outline-none focus:border-primary" />
          </label>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Choose material">
            {BIN_CATEGORIES.map((c) => (
              <button key={c} onClick={() => { setPick(c); setQ(""); }} aria-pressed={cat === c} className={cn("rounded-full transition-all", cat === c ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100")}><CategoryChip cat={c} /></button>
            ))}
          </div>
        </div>
        {matches.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {matches.map((m) => <button key={m.name} onClick={() => { setPick(m.cat); setQ(""); }} className="rounded-full border px-3 py-1.5 text-sm hover:border-primary">{m.name} → <span className={CAT[m.cat].text}>{CAT[m.cat].label}</span></button>)}
          </div>
        )}
        {q && matches.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No match. Try the <Link to="/scanner" className="text-primary underline">AI Scanner</Link> instead.</p>}
      </Panel>

      {showAi && (
        <Panel className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          {rec.thumb && <img src={rec.thumb} alt="" className="h-20 w-20 rounded-2xl object-cover" />}
          <div className="flex-1">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary"><Sparkles className="h-3.5 w-3.5" />{rec.demo ? "Demo record" : "From your AI scan"}</p>
            <p className="text-xl font-bold">{rec.result.item_name}</p>
            <p className="text-sm text-muted-foreground">{rec.result.explanation}</p>
          </div>
          {rec.confirmedCategory && <Button variant="hero" asChild><Link to="/digital-twin"><Boxes /> View Digital Twin</Link></Button>}
        </Panel>
      )}

      <h2 className="mt-12 font-display text-3xl font-extrabold text-hero-shadow"><span className={CAT[cat].text}>{CAT[cat].label}</span> guidance</h2>
      {cat === "hazardous" && <p className="mt-3 flex gap-2 text-warning"><ShieldAlert className="h-5 w-5" /> Never place hazardous items in household bins. Use an official collection point.</p>}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {sections.map((s) => (
          <Panel key={s.t} className="transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15"><s.i className="h-5 w-5 text-primary" /></span><h3 className="text-lg font-bold">{s.t}</h3></div>
            <ul className="mt-4 space-y-2">{s.xs.map((x) => <li key={x} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />{x}</li>)}</ul>
            <p className="mt-4 text-xs text-muted-foreground">Why: {s.why}</p>
          </Panel>
        ))}
      </div>
      <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground"><Info className="h-4 w-4" /> General guidance only — rules differ between councils. Check your local waste authority.</p>
    </AppShell>
  );
}
