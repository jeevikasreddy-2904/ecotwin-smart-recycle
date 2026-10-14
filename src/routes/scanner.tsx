import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { Upload, Camera, Smartphone, Images, Trash2, Loader2, CheckCircle2, AlertTriangle, RotateCcw, Sparkles, Lightbulb, Boxes, ShieldAlert, Pencil, Sun } from "lucide-react";
import { AppShell, Panel } from "@/components/eco/AppShell";
import { CategoryChip } from "@/components/eco/CategoryChip";
import { CameraDialog } from "@/components/eco/CameraDialog";
import { Button } from "@/components/ui/button";
import { CAT, CATEGORIES, BIN_CATEGORIES, type Category } from "@/lib/categories";
import { classifyWaste } from "@/lib/classify.functions";
import { resize, validateFile } from "@/lib/image";
import { addScan, confirmScan, useStore, type Classification } from "@/lib/store";
import { cn } from "@/lib/utils";
import scanImg from "@/assets/scan.jpg";

export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      { title: "AI Waste Scanner — EcoTwin AI" },
      { name: "description", content: "Upload or snap a photo of waste and let AI identify the material and how to dispose of it." },
      { property: "og:title", content: "AI Waste Scanner — EcoTwin AI" },
      { property: "og:description", content: "Photo in, material and next best action out." },
    ],
  }),
  component: Scanner,
});

type Item = { id: string; preview: string; status: "ready" | "scanning" | "done" | "unclear" | "error"; error?: string | undefined; result?: Classification; scanId?: string };

const uid = () => (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);

function Scanner() {
  const store = useStore();
  const [items, setItems] = useState<Item[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [cam, setCam] = useState<null | "user" | "environment">(null);
  const [drag, setDrag] = useState(false);
  const [changing, setChanging] = useState(false);
  const busy = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  const current = items.find((i) => i.id === sel) ?? null;
  const record = current?.scanId ? store.scans.find((s) => s.id === current.scanId) : undefined;
  const patch = (id: string, p: Partial<Item>) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).slice(0, 10);
    const added: Item[] = [];
    for (const f of list) {
      const err = validateFile(f);
      if (err) { toast.error(err); continue; }
      try { added.push({ id: uid(), preview: await resize(f, 1280), status: "ready" }); }
      catch { toast.error(`${f.name}: could not read this image.`); }
    }
    if (added.length) { setItems((xs) => [...xs, ...added]); setSel(added[0]!.id); }
  };
  const addDataUrl = async (d: string) => {
    const it: Item = { id: uid(), preview: await resize(d, 1280), status: "ready" };
    setItems((xs) => [...xs, it]); setSel(it.id); setCam(null);
  };

  const analyse = async (it: Item) => {
    patch(it.id, { status: "scanning", error: undefined });
    try {
      const r = await classifyWaste({ data: { image: it.preview } });
      if (!r.ok) { patch(it.id, { status: "error", error: r.error }); toast.error(r.error); return; }
      const res = JSON.parse(r.data) as Classification;
      if (!CATEGORIES.includes(res.category)) res.category = "unknown";
      const unclear = !res.is_clear || res.category === "unknown" || res.confidence < 0.4;
      const thumb = await resize(it.preview, 160, 0.7);
      const scanId = uid();
      addScan({ id: scanId, createdAt: Date.now(), thumb, status: unclear ? "unclear" : "classified", result: res });
      patch(it.id, { status: unclear ? "unclear" : "done", result: res, scanId });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      patch(it.id, { status: "error", error: `Scan failed: ${msg}. Check your connection and retry.` });
    }
  };

  const analyseAll = async () => {
    if (busy.current) return;
    busy.current = true;
    try { for (const it of items.filter((i) => i.status === "ready" || i.status === "error")) { setSel(it.id); await analyse(it); } }
    finally { busy.current = false; }
  };
  const scanning = items.some((i) => i.status === "scanning");
  const pending = items.filter((i) => i.status === "ready" || i.status === "error").length;

  const confirm = (cat: Category) => {
    if (!current?.scanId) return;
    const changed = confirmScan(current.scanId, cat);
    setChanging(false);
    if (changed) toast.success(`Added to ${CAT[cat].label} bin`, { description: "Your Digital Twin has been updated." });
    else toast("Already confirmed — not counted twice.");
  };

  const onDrop = (e: DragEvent) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) void addFiles(e.dataTransfer.files); };

  return (
    <AppShell title="AI Scanner" image={scanImg} eyebrow="Computer vision · Real AI analysis"
      heading={<>Give your waste a <span className="text-gradient-brand">second life.</span></>}
      description="Upload a photo, identify the material, and discover your next best action.">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT */}
        <Panel>
          <h2 className="text-lg font-bold">1 · Add photos</h2>
          <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}
            className={cn("mt-4 grid place-items-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors", drag ? "border-primary bg-primary/10" : "border-border")}>
            <Upload className="h-10 w-10 text-primary" />
            <p className="mt-3 font-semibold">Drag & drop images here</p>
            <p className="text-sm text-muted-foreground">JPG, PNG or WebP · up to 10 MB · up to 10 at once</p>
            <div className="mt-5 grid w-full gap-2 sm:grid-cols-2">
              <Button variant="hero" onClick={() => fileRef.current?.click()}><Images /> Browse / multiple</Button>
              <Button variant="glass" onClick={() => setCam("environment")}><Camera /> Back camera</Button>
              <Button variant="glass" onClick={() => setCam("user")}><Smartphone /> Selfie camera</Button>
              <Button variant="glass" onClick={() => backRef.current?.click()} className="sm:hidden"><Camera /> Phone camera app</Button>
              <Button variant="glass" onClick={() => selfieRef.current?.click()} className="hidden sm:inline-flex"><Upload /> Device camera app</Button>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => { if (e.target.files) void addFiles(e.target.files); e.target.value = ""; }} />
            <input ref={backRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { if (e.target.files) void addFiles(e.target.files); e.target.value = ""; }} />
            <input ref={selfieRef} type="file" accept="image/*" capture="user" hidden onChange={(e) => { if (e.target.files) void addFiles(e.target.files); e.target.value = ""; }} />
          </div>

          {items.length > 0 && (
            <>
              <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-5">
                {items.map((it) => (
                  <button key={it.id} onClick={() => setSel(it.id)} className={cn("relative aspect-square overflow-hidden rounded-xl border-2", sel === it.id ? "border-primary shadow-glow" : "border-transparent")} aria-label="Select image">
                    <img src={it.preview} alt="" className="h-full w-full object-cover" />
                    <span className="absolute bottom-1 right-1 rounded-full bg-background/80 p-0.5">
                      {it.status === "scanning" ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> : it.status === "done" ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> : it.status === "unclear" || it.status === "error" ? <AlertTriangle className="h-3.5 w-3.5 text-warning" /> : null}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="hero" onClick={analyseAll} disabled={scanning || pending === 0}>
                  {scanning ? <Loader2 className="animate-spin" /> : <Sparkles />} {scanning ? "Analysing…" : `Analyse ${pending || ""} image${pending === 1 ? "" : "s"}`}
                </Button>
                {current && <Button variant="outline" disabled={current.status === "scanning"} onClick={() => { setItems((xs) => xs.filter((x) => x.id !== current.id)); setSel(items.find((x) => x.id !== current.id)?.id ?? null); }}><Trash2 /> Remove</Button>}
              </div>
            </>
          )}

          <div className="mt-6 flex gap-3 rounded-2xl bg-forest/50 p-4 text-sm text-muted-foreground">
            <Sun className="h-5 w-5 shrink-0 text-lime" />
            <p>Best results: one item per photo, good lighting, plain background, item filling most of the frame.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">{BIN_CATEGORIES.map((c) => <CategoryChip key={c} cat={c} />)}</div>
        </Panel>

        {/* RIGHT */}
        <Panel className="min-h-[28rem]">
          <h2 className="text-lg font-bold">2 · AI analysis</h2>
          {!current && (
            <div className="grid h-80 place-items-center text-center text-muted-foreground">
              <div><Sparkles className="mx-auto h-10 w-10 text-primary" /><p className="mt-3 max-w-xs">Add a photo and press Analyse. A vision AI model will identify the material and suggest what to do next.</p></div>
            </div>
          )}
          {current && (
            <div className="mt-4 space-y-5">
              <div className="relative overflow-hidden rounded-2xl">
                <img src={current.preview} alt="Selected waste item" className="max-h-72 w-full object-cover" />
                {current.status === "scanning" && (
                  <div className="absolute inset-0 bg-background/40">
                    <div className="absolute inset-x-0 h-1 animate-scanline bg-gradient-brand shadow-glow" />
                    <p className="absolute bottom-3 left-3 flex items-center gap-2 text-sm font-semibold text-hero-shadow"><Loader2 className="h-4 w-4 animate-spin" /> Analysing material…</p>
                  </div>
                )}
              </div>

              {current.status === "ready" && <p className="text-muted-foreground">Ready to analyse. Press <b className="text-foreground">Analyse</b>.</p>}
              {current.status === "scanning" && <div className="space-y-2">{[80, 60, 70].map((w) => <div key={w} className="h-4 animate-pulse rounded bg-muted" style={{ width: `${w}%` }} />)}</div>}

              {current.status === "error" && (
                <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
                  <p className="flex items-center gap-2 font-semibold text-destructive"><AlertTriangle className="h-4 w-4" /> Scan didn't complete</p>
                  <p className="mt-1 text-sm text-muted-foreground">{current.error}</p>
                  <Button className="mt-3" size="sm" variant="outline" onClick={() => analyse(current)}><RotateCcw /> Retry</Button>
                </div>
              )}

              {current.status === "unclear" && current.result && (
                <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4">
                  <p className="flex items-center gap-2 font-semibold text-warning"><AlertTriangle className="h-4 w-4" /> Please upload a clearer image</p>
                  <p className="mt-1 text-sm text-muted-foreground">{current.result.explanation}</p>
                  <p className="mt-2 text-xs text-muted-foreground">We don't guess when the AI isn't confident. Try one item, better light and a plain background.</p>
                  <Button className="mt-3" size="sm" variant="outline" onClick={() => fileRef.current?.click()}><Upload /> Upload another photo</Button>
                </div>
              )}

              {current.status === "done" && current.result && <Result r={current.result} confirmed={record?.confirmedCategory} scanId={current.scanId!}
                changing={changing} setChanging={setChanging} onConfirm={confirm} />}
            </div>
          )}
        </Panel>
      </div>
      {cam && <CameraDialog facing={cam} onClose={() => setCam(null)} onCapture={(d) => void addDataUrl(d)} />}
    </AppShell>
  );
}

const RECYC: Record<Classification["recyclability"], string> = {
  likely: "Likely recyclable in most areas",
  depends: "Depends on your local scheme",
  unlikely: "Unlikely to be recyclable",
  special: "Needs special disposal",
};

function Result({ r, confirmed, scanId, changing, setChanging, onConfirm }: { r: Classification; confirmed?: Category | undefined; scanId: string; changing: boolean; setChanging: (b: boolean) => void; onConfirm: (c: Category) => void }) {
  const pct = Math.round(Math.max(0, Math.min(1, r.confidence)) * 100);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <CategoryChip cat={r.category} className="text-sm" />
        <span className="rounded-full border border-primary/30 px-2.5 py-1 text-xs font-semibold text-primary">AI result · model self-estimate {pct}%</span>
      </div>
      <div>
        <h3 className="text-2xl font-extrabold">{r.item_name}</h3>
        <p className="mt-1 text-muted-foreground">{r.explanation}</p>
        <p className="mt-2 text-sm font-semibold text-lime">{RECYC[r.recyclability]}</p>
      </div>
      <Lists r={r} />
      {r.safety_notice && <p className="flex gap-2 rounded-2xl border border-cat-hazardous/40 bg-cat-hazardous/10 p-3 text-sm"><ShieldAlert className="h-4 w-4 shrink-0 text-cat-hazardous" /> {r.safety_notice}</p>}
      <p className="text-xs text-muted-foreground">AI guidance is general. Always check your local council's recycling rules.</p>

      <div className="border-t pt-4">
        {confirmed ? (
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary"><CheckCircle2 className="h-4 w-4" /> Confirmed as {CAT[confirmed].label} · added to Digital Twin</p>
        ) : <p className="mb-3 text-sm text-muted-foreground">Confirm to record this sorting action and update your Digital Twin.</p>}
        <div className="flex flex-wrap gap-2">
          {!confirmed && r.category !== "unknown" && <Button variant="hero" onClick={() => onConfirm(r.category)}><CheckCircle2 /> Confirm & add to Digital Twin</Button>}
          <Button variant="glass" onClick={() => setChanging(!changing)}><Pencil /> Change category</Button>
          <Button variant="glass" asChild><Link to="/recommendations" search={{ scan: scanId }}><Lightbulb /> View recommendations</Link></Button>
          {confirmed && <Button variant="glass" asChild><Link to="/digital-twin"><Boxes /> View Digital Twin</Link></Button>}
        </div>
        {changing && (
          <div className="mt-3 flex flex-wrap gap-2">
            {BIN_CATEGORIES.map((c) => <button key={c} onClick={() => onConfirm(c)} className="transition-transform hover:scale-105"><CategoryChip cat={c} /></button>)}
          </div>
        )}
      </div>
    </div>
  );
}

function Lists({ r }: { r: Pick<Classification, "preparation" | "reuse" | "disposal"> }) {
  const blocks = [
    { t: "Prepare", xs: r.preparation },
    { t: "Reuse ideas", xs: r.reuse },
    { t: "Disposal", xs: r.disposal },
  ].filter((b) => b.xs.length);
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {blocks.map((b) => (
        <div key={b.t} className="rounded-2xl bg-forest/50 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">{b.t}</p>
          <ul className="mt-2 space-y-1.5 text-sm">{b.xs.map((x) => <li key={x}>• {x}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}
