import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BellRing, Siren, Trash, Database, RotateCcw, Undo2, ScanLine, Eye, CheckCircle2, Boxes, Recycle } from "lucide-react";
import { AppShell, Panel } from "@/components/eco/AppShell";
import { Bin } from "@/components/eco/Bin";
import { CategoryChip } from "@/components/eco/CategoryChip";
import { Button } from "@/components/ui/button";
import { BIN_CAPACITY, BIN_CATEGORIES, CAT, type Category } from "@/lib/categories";
import { binCounts, clearDemo, emptyBin, hasDemo, seedDemo, unconfirmScan, useStore } from "@/lib/store";
import { triggerBinAlert } from "@/lib/alerts";
import { cn } from "@/lib/utils";
import bins from "@/assets/bins.jpg";

export const Route = createFileRoute("/digital-twin")({
  head: () => ({
    meta: [
      { title: "Digital Twin — EcoTwin AI" },
      { name: "description", content: "A virtual recycling station that fills as you confirm sorting decisions, with full-bin alarms." },
      { property: "og:title", content: "Digital Twin — EcoTwin AI" },
      { property: "og:description", content: "Your waste. Reimagined in real time." },
    ],
  }),
  component: Twin,
});

const RANGES = [{ k: 1, l: "24h" }, { k: 7, l: "7 days" }, { k: 30, l: "30 days" }, { k: 0, l: "All" }];

function Twin() {
  const store = useStore();
  const counts = binCounts(store);
  const [sel, setSel] = useState<Category>("plastic");
  const [range, setRange] = useState(30);
  const demo = hasDemo(store);
  const since = range ? Date.now() - range * 86400000 : 0;
  const recent = useMemo(() => store.scans.filter((s) => s.confirmedCategory && (s.confirmedAt ?? 0) >= since).sort((a, b) => (b.confirmedAt ?? 0) - (a.confirmedAt ?? 0)), [store.scans, since]);
  const identified = store.scans.filter((s) => s.createdAt >= since).length;
  const total = recent.length;

  return (
    <AppShell title="Digital Twin" image={bins} eyebrow="Virtual recycling station"
      heading={<>Your waste. Reimagined <span className="text-gradient-brand">in real time.</span></>}
      description="See your sorting decisions come to life inside a virtual recycling ecosystem."
      actions={<>
        <Button variant="warning" onClick={() => triggerBinAlert(sel, "warning", true)}><BellRing /> Demo: almost-full alert</Button>
        <Button variant="destructive" onClick={() => triggerBinAlert(sel, "full", true)}><Siren /> Demo: full-bin alarm</Button>
        {!demo ? <Button variant="glass" onClick={() => { seedDemo(); toast("Demo data loaded", { description: "Clearly labeled demo records were added." }); }}><Database /> Load demo data</Button>
          : <Button variant="glass" onClick={() => { clearDemo(); toast("Demo data removed"); }}><RotateCcw /> Reset demo</Button>}
      </>}>
      {demo && <p className="mb-4 inline-flex rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">Demo data active — some records are simulated</p>}
      <p className="mb-4 text-xs text-muted-foreground">Simulation stored on this device only. Bin capacity: {BIN_CAPACITY} items. Warning at 80%, alarm at 100%.</p>

      {/* station */}
      <Panel className="relative overflow-hidden">
        <div className="absolute inset-x-6 bottom-16 h-3 rounded-full bg-primary/20 blur-md" aria-hidden />
        <div className="relative flex flex-wrap items-end justify-center gap-1 sm:gap-3 [perspective:800px]">
          {BIN_CATEGORIES.map((c) => <Bin key={c} cat={c} count={counts[c] ?? 0} selected={sel === c} onClick={() => setSel(c)} />)}
        </div>
      </Panel>

      {/* flow */}
      <Panel className="mt-6">
        <h2 className="text-lg font-bold">Material flow</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[{ i: ScanLine, l: "Identified", v: identified }, { i: CheckCircle2, l: "Confirmed", v: total }, { i: Boxes, l: "Sorted into bins", v: total }, { i: Recycle, l: "Recovery pathway", v: "Simulated" }].map((s, n) => (
            <div key={s.l} className="relative rounded-2xl bg-forest/50 p-4">
              <s.i className="h-5 w-5 text-primary" />
              <p className="mt-2 text-2xl font-extrabold tabular-nums">{s.v}</p>
              <p className="text-xs text-muted-foreground">{s.l}</p>
              {n < 3 && <div className="absolute -right-3 top-1/2 hidden h-1 w-6 rounded-full animate-flow md:block" />}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">A visual model of your decisions — it does not track physical waste.</p>
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Panel>
          <div className="flex items-center justify-between"><CategoryChip cat={sel} className="text-sm" /><span className="text-sm text-muted-foreground">{counts[sel] ?? 0}/{BIN_CAPACITY}</span></div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted"><div className={cn("h-full transition-all duration-700", CAT[sel].fill)} style={{ width: `${Math.min(100, ((counts[sel] ?? 0) / BIN_CAPACITY) * 100)}%` }} /></div>
          <p className="mt-4 text-sm text-muted-foreground">Emptying a bin resets its fill level. Your history is kept.</p>
          <Button variant="glass" className="mt-4" onClick={() => { emptyBin(sel); toast.success(`${CAT[sel].label} bin emptied`); }}><Trash /> Empty this bin</Button>
          <h3 className="mt-6 text-sm font-bold">Distribution ({RANGES.find((r) => r.k === range)?.l})</h3>
          <div className="mt-3 space-y-2">
            {BIN_CATEGORIES.map((c) => { const n = recent.filter((r) => r.confirmedCategory === c).length; return (
              <div key={c} className="flex items-center gap-3 text-xs"><span className="w-28 truncate">{CAT[c].label}</span><div className="h-2 flex-1 rounded-full bg-muted"><div className={cn("h-full rounded-full", CAT[c].fill)} style={{ width: total ? `${(n / total) * 100}%` : 0 }} /></div><span className="w-6 text-right tabular-nums">{n}</span></div>
            ); })}
          </div>
        </Panel>
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">Recent sorting activity</h2>
            <div className="flex gap-1">{RANGES.map((r) => <button key={r.k} onClick={() => setRange(r.k)} className={cn("rounded-full px-3 py-1 text-xs font-semibold", range === r.k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}>{r.l}</button>)}</div>
          </div>
          {recent.length === 0 ? (
            <div className="grid h-56 place-items-center text-center text-muted-foreground"><div><Eye className="mx-auto h-8 w-8 text-primary" /><p className="mt-2">No confirmed items yet.</p><Button variant="hero" size="sm" className="mt-3" asChild><Link to="/scanner">Scan an item</Link></Button></div></div>
          ) : (
            <ul className="mt-4 max-h-96 divide-y overflow-auto">
              {recent.slice(0, 30).map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-2.5">
                  {r.thumb ? <img src={r.thumb} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-muted" />}
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{r.result.item_name}{r.demo && <span className="ml-2 text-[10px] text-warning">DEMO</span>}</p><p className="text-xs text-muted-foreground">{new Date(r.confirmedAt!).toLocaleString()}</p></div>
                  <CategoryChip cat={r.confirmedCategory!} className="hidden sm:inline-flex" />
                  <Button variant="ghost" size="icon" aria-label="Undo confirmation" onClick={() => { unconfirmScan(r.id); toast("Confirmation undone"); }}><Undo2 /></Button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
