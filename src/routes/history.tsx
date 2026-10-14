import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, X, Trash2, Undo2, Lightbulb, CheckCircle2, CircleDashed, AlertTriangle, ScanLine } from "lucide-react";
import { AppShell, Panel } from "@/components/eco/AppShell";
import { CategoryChip } from "@/components/eco/CategoryChip";
import { Button } from "@/components/ui/button";
import { CATEGORIES, CAT, type Category } from "@/lib/categories";
import { deleteScan, unconfirmScan, confirmScan, useStore, type ScanRecord } from "@/lib/store";
import historyImg from "@/assets/history.jpg";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Scan History — EcoTwin AI" },
      { name: "description", content: "Review previous scans, predictions and confirmed sorting decisions." },
      { property: "og:title", content: "Scan History — EcoTwin AI" },
      { property: "og:description", content: "Every small action counts." },
    ],
  }),
  component: HistoryPage,
});

const sel = "h-11 rounded-full border bg-background/40 px-4 text-sm outline-none focus:border-primary";

function HistoryPage() {
  const store = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | Category>("all");
  const [days, setDays] = useState(30);
  const [order, setOrder] = useState<"new" | "old">("new");
  const [limit, setLimit] = useState(12);
  const [open, setOpen] = useState<ScanRecord | null>(null);

  const rows = useMemo(() => {
    const since = days ? Date.now() - days * 86400000 : 0;
    return store.scans
      .filter((s) => s.createdAt >= since)
      .filter((s) => cat === "all" || (s.confirmedCategory ?? s.result.category) === cat)
      .filter((s) => !q || s.result.item_name.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => (order === "new" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt));
  }, [store.scans, q, cat, days, order]);

  const current = open ? store.scans.find((s) => s.id === open.id) ?? null : null;

  return (
    <AppShell title="Scan History" image={historyImg} eyebrow="Your records"
      heading={<>Every small action <span className="text-gradient-brand">counts.</span></>}
      description="Review your previous scans and confirmed sorting decisions.">
      <Panel>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <label className="relative"><span className="sr-only">Search</span><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search items…" className={`${sel} w-full pl-11`} /></label>
          <select aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value as Category | "all")} className={sel}><option value="all">All categories</option>{CATEGORIES.map((c) => <option key={c} value={c}>{CAT[c].label}</option>)}</select>
          <select aria-label="Date range" value={days} onChange={(e) => setDays(+e.target.value)} className={sel}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option><option value={0}>All time</option></select>
          <select aria-label="Sort" value={order} onChange={(e) => setOrder(e.target.value as "new" | "old")} className={sel}><option value="new">Newest first</option><option value="old">Oldest first</option></select>
        </div>
      </Panel>

      {store.ready && rows.length === 0 ? (
        <Panel className="mt-6 py-16 text-center">
          <ScanLine className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-3 text-xl font-bold">{store.scans.length ? "No scans match your filters" : "No scans yet"}</p>
          <Button variant="hero" className="mt-5" asChild><Link to="/scanner">Scan an Item</Link></Button>
        </Panel>
      ) : (
        <>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.slice(0, limit).map((s) => (
              <li key={s.id}>
                <button onClick={() => setOpen(s)} className="glass flex w-full items-center gap-4 rounded-3xl p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-glow">
                  {s.thumb ? <img src={s.thumb} alt="" className="h-16 w-16 rounded-2xl object-cover" /> : <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted text-[10px] text-muted-foreground">{s.demo ? "DEMO" : "No image"}</div>}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{s.result.item_name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5"><CategoryChip cat={s.confirmedCategory ?? s.result.category} /><Status s={s} /></div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          {rows.length > limit && <div className="mt-6 text-center"><Button variant="glass" onClick={() => setLimit(limit + 12)}>Load more ({rows.length - limit} left)</Button></div>}
        </>
      )}

      {current && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur" role="dialog" aria-modal="true" aria-label="Scan details" onClick={() => setOpen(null)}>
          <div className="glass max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3"><h2 className="text-2xl font-extrabold">{current.result.item_name}</h2><Button variant="ghost" size="icon" onClick={() => setOpen(null)} aria-label="Close"><X /></Button></div>
            {current.thumb && <img src={current.thumb} alt="" className="mt-4 h-40 w-40 rounded-2xl object-cover" />}
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex gap-2"><dt className="w-36 text-muted-foreground">AI prediction</dt><dd><CategoryChip cat={current.result.category} /></dd></div>
              <div className="flex gap-2"><dt className="w-36 text-muted-foreground">Your confirmation</dt><dd>{current.confirmedCategory ? <CategoryChip cat={current.confirmedCategory} /> : "Not confirmed"}</dd></div>
              <div className="flex gap-2"><dt className="w-36 text-muted-foreground">Disposal outcome</dt><dd>Unknown — not tracked</dd></div>
            </dl>
            <p className="mt-4 text-sm text-muted-foreground">{current.result.explanation}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="glass" size="sm" asChild><Link to="/recommendations" search={{ scan: current.id }}><Lightbulb /> Recommendations</Link></Button>
              {current.confirmedCategory ? <Button variant="glass" size="sm" onClick={() => { unconfirmScan(current.id); toast("Confirmation undone"); }}><Undo2 /> Undo confirmation</Button>
                : current.status === "classified" && <Button variant="hero" size="sm" onClick={() => { confirmScan(current.id, current.result.category); toast.success("Confirmed & added to Digital Twin"); }}><CheckCircle2 /> Confirm</Button>}
              <Button variant="ghost" size="sm" onClick={() => { deleteScan(current.id); setOpen(null); toast("Scan deleted"); }}><Trash2 /> Delete</Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Status({ s }: { s: ScanRecord }) {
  if (s.status === "unclear") return <span className="flex items-center gap-1 text-xs text-warning"><AlertTriangle className="h-3 w-3" />Unclear</span>;
  if (s.confirmedCategory) return <span className="flex items-center gap-1 text-xs text-primary"><CheckCircle2 className="h-3 w-3" />Confirmed{s.demo && " · demo"}</span>;
  return <span className="flex items-center gap-1 text-xs text-muted-foreground"><CircleDashed className="h-3 w-3" />Prediction{s.demo && " · demo"}</span>;
}
