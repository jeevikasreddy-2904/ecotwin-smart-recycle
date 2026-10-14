import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Leaf, Layers, ScanLine, CheckCircle2, Calculator } from "lucide-react";
import { AppShell, Panel } from "@/components/eco/AppShell";
import { Bin } from "@/components/eco/Bin";
import { Button } from "@/components/ui/button";
import { BIN_CATEGORIES, CAT } from "@/lib/categories";
import { binCounts, hasDemo, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import impact from "@/assets/impact.jpg";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Impact Dashboard — EcoTwin AI" },
      { name: "description", content: "Sorting activity over time, material distribution and bin levels — built from your own records." },
      { property: "og:title", content: "Impact Dashboard — EcoTwin AI" },
      { property: "og:description", content: "Measure every meaningful action." },
    ],
  }),
  component: Impact,
});

const RANGES = [7, 30, 90];

function Impact() {
  const store = useStore();
  const [days, setDays] = useState(30);
  const since = Date.now() - days * 86400000;
  const conf = store.scans.filter((s) => s.confirmedCategory && (s.confirmedAt ?? 0) >= since);
  const scans = store.scans.filter((s) => s.createdAt >= since);
  const counts = binCounts(store);

  const series = useMemo(() => {
    const out: { d: string; sorted: number; scans: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - i);
      const end = start.getTime() + 86400000;
      out.push({
        d: start.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        sorted: conf.filter((s) => s.confirmedAt! >= start.getTime() && s.confirmedAt! < end).length,
        scans: scans.filter((s) => s.createdAt >= start.getTime() && s.createdAt < end).length,
      });
    }
    return out;
  }, [conf, scans, days]);

  const dist = BIN_CATEGORIES.map((c) => ({ name: CAT[c].label, value: conf.filter((s) => s.confirmedCategory === c).length, color: CAT[c].color })).filter((x) => x.value);

  return (
    <AppShell title="Impact Dashboard" image={impact} eyebrow="Impact analytics"
      heading={<>Measure every <span className="text-gradient-brand">meaningful action.</span></>}
      description="Understand your recycling activity and the difference your choices may make."
      actions={<div className="flex gap-1 rounded-full glass p-1">{RANGES.map((r) => <button key={r} onClick={() => setDays(r)} className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", days === r ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{r} days</button>)}</div>}>
      {hasDemo(store) && <p className="mb-4 inline-flex rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">Includes labeled demo records</p>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi i={CheckCircle2} v={conf.length} l="Confirmed items sorted" />
        <Kpi i={ScanLine} v={scans.length} l="Scans performed" />
        <Kpi i={Layers} v={new Set(conf.map((c) => c.confirmedCategory)).size} l="Categories handled" />
        <Kpi i={Leaf} v={scans.length ? `${Math.round((conf.length / scans.length) * 100)}%` : "—"} l="Scans confirmed" />
      </div>

      {store.ready && store.scans.length === 0 ? (
        <Panel className="mt-6 py-16 text-center">
          <p className="text-xl font-bold">No activity yet</p>
          <p className="mt-2 text-muted-foreground">Scan and confirm items, or load demo data from the Digital Twin.</p>
          <div className="mt-5 flex justify-center gap-3"><Button variant="hero" asChild><Link to="/scanner">Scan an item</Link></Button><Button variant="glass" asChild><Link to="/digital-twin">Digital Twin</Link></Button></div>
        </Panel>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Panel>
            <h2 className="font-bold">Sorting activity · last {days} days</h2>
            <div className="mt-4 h-72" role="img" aria-label={`Area chart of daily scans and confirmed items over the last ${days} days`}>
              <ResponsiveContainer>
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--mint)" stopOpacity={0.6} /><stop offset="100%" stopColor="var(--mint)" stopOpacity={0} /></linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--lime)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--lime)" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  <Area type="monotone" dataKey="scans" name="Scans" stroke="var(--lime)" fill="url(#g2)" strokeWidth={2} />
                  <Area type="monotone" dataKey="sorted" name="Confirmed" stroke="var(--mint)" fill="url(#g1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel>
            <h2 className="font-bold">Material distribution</h2>
            {dist.length === 0 ? <p className="mt-10 text-center text-muted-foreground">No confirmed items in this period.</p> : (
              <>
                <div className="mt-2 h-52"><ResponsiveContainer><PieChart><Pie data={dist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3} stroke="none">{dist.map((d) => <Cell key={d.name} fill={d.color} />)}</Pie><Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} /></PieChart></ResponsiveContainer></div>
                <ul className="grid grid-cols-2 gap-1.5 text-xs">{dist.map((d) => <li key={d.name} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />{d.name} · {d.value}</li>)}</ul>
              </>
            )}
          </Panel>
        </div>
      )}

      <Panel className="mt-6">
        <h2 className="font-bold">Digital Twin bin levels</h2>
        <div className="mt-4 flex flex-wrap justify-center gap-1">{BIN_CATEGORIES.map((c) => <Bin key={c} cat={c} count={counts[c] ?? 0} compact />)}</div>
      </Panel>

      <Panel className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-warning/15"><Calculator className="h-7 w-7 text-warning" /></span>
        <div>
          <p className="text-lg font-bold">Impact estimates not configured yet</p>
          <p className="text-sm text-muted-foreground">We don't show CO₂, water or "trees saved" figures without verified per-material factors (e.g. from a recognised LCA dataset) and item weights. Sorting an item is not proof it was recycled. "Items sorted" above is a measured count; environmental impact would be a separate estimate.</p>
        </div>
      </Panel>
    </AppShell>
  );
}

function Kpi({ i: I, v, l }: { i: typeof Leaf; v: string | number; l: string }) {
  return (
    <Panel className="p-5">
      <I className="h-5 w-5 text-primary" />
      <p className="mt-3 text-3xl font-extrabold tabular-nums text-gradient-brand">{v}</p>
      <p className="text-xs text-muted-foreground">{l}</p>
    </Panel>
  );
}
