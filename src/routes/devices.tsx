import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/eco/AppShell";
import { NAV } from "@/components/eco/nav";
import { cn } from "@/lib/utils";
import devices from "@/assets/devices.jpg";

export const Route = createFileRoute("/devices")({
  head: () => ({
    meta: [
      { title: "Device Preview — EcoTwin AI" },
      { name: "description", content: "Preview EcoTwin AI on iPhone, Android, tablet and laptop screens." },
      { property: "og:title", content: "Device Preview — EcoTwin AI" },
      { property: "og:description", content: "One app, every screen." },
    ],
  }),
  component: Devices,
});

const DEVICES = [
  { k: "iphone", l: "iPhone 15", w: 393, h: 852, frame: "rounded-[3rem] p-3", notch: "island" },
  { k: "android", l: "Android (Pixel 8)", w: 412, h: 915, frame: "rounded-[2.4rem] p-2.5", notch: "punch" },
  { k: "tablet", l: "Tablet (iPad)", w: 820, h: 1180, frame: "rounded-[2rem] p-4", notch: "" },
  { k: "laptop", l: "Laptop", w: 1440, h: 900, frame: "rounded-t-2xl p-3", notch: "" },
] as const;

function Devices() {
  const [path, setPath] = useState("/");
  const [show, setShow] = useState<string>("all");
  const list = DEVICES.filter((d) => show === "all" || d.k === show);
  return (
    <AppShell title="Device Preview" image={devices} eyebrow="Responsive preview"
      heading={<>One app, <span className="text-gradient-brand">every screen.</span></>}
      description="See EcoTwin AI live on iPhone, Android, tablet and laptop. Each frame runs the real app.">
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <select aria-label="Page" value={path} onChange={(e) => setPath(e.target.value)} className="h-11 rounded-full border bg-background/40 px-4 text-sm">
          {NAV.filter((n) => n.to !== "/devices").map((n) => <option key={n.to} value={n.to}>{n.label}</option>)}
        </select>
        <div className="glass flex flex-wrap gap-1 rounded-full p-1">
          {[{ k: "all", l: "All" }, ...DEVICES].map((d) => <button key={d.k} onClick={() => setShow(d.k)} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm", show === d.k ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{d.l}</button>)}
        </div>
      </div>
      <div className="flex flex-wrap items-end justify-center gap-10">
        {list.map((d) => <Frame key={d.k} d={d} path={path} scale={show === "all" ? (d.k === "laptop" ? 0.42 : d.k === "tablet" ? 0.38 : 0.6) : d.k === "laptop" ? 0.6 : d.k === "tablet" ? 0.55 : 0.8} />)}
      </div>
    </AppShell>
  );
}

function Frame({ d, path, scale }: { d: (typeof DEVICES)[number]; path: string; scale: number }) {
  return (
    <figure className="flex flex-col items-center">
      <div className={cn("relative bg-forest shadow-card ring-1 ring-border", d.frame)}>
        <div className="relative overflow-hidden rounded-[inherit] bg-background" style={{ width: d.w * scale, height: d.h * scale, borderRadius: d.k === "laptop" ? 8 : d.k === "tablet" ? 20 : 36 }}>
          <iframe title={`${d.l} preview`} src={path} loading="lazy" style={{ width: d.w, height: d.h, transform: `scale(${scale})`, transformOrigin: "0 0", border: 0 }} />
          {d.notch === "island" && <div className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-background ring-1 ring-border" style={{ transform: `translateX(-50%) scale(${scale / 0.8})` }} />}
          {d.notch === "punch" && <div className="absolute left-1/2 top-2.5 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-background ring-1 ring-border" />}
        </div>
      </div>
      {d.k === "laptop" && <div className="h-3 rounded-b-xl bg-elevated ring-1 ring-border" style={{ width: d.w * scale + 80 }} />}
      <figcaption className="mt-4 text-sm font-semibold text-muted-foreground">{d.l} · {d.w}×{d.h}</figcaption>
    </figure>
  );
}
