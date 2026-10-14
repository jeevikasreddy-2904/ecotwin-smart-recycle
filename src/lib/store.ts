import { useEffect, useState } from "react";
import { BIN_CAPACITY, BIN_CATEGORIES, WARN_RATIO, type Category } from "./categories";
import { triggerBinAlert } from "./alerts";

export type Classification = {
  is_clear: boolean;
  category: Category;
  item_name: string;
  confidence: number;
  explanation: string;
  recyclability: "likely" | "depends" | "unlikely" | "special";
  preparation: string[];
  reuse: string[];
  disposal: string[];
  safety_notice: string | null;
};

export type ScanRecord = {
  id: string;
  createdAt: number;
  thumb?: string; // small local-only data URL
  status: "classified" | "unclear";
  result: Classification;
  confirmedCategory?: Category;
  confirmedAt?: number;
  demo?: boolean;
};

type State = { scans: ScanRecord[]; emptiedAt: Partial<Record<Category, number>> };
const KEY = "ecotwin.v1";
const EMPTY: State = { scans: [], emptiedAt: {} };
let state: State = EMPTY;
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw);
  } catch { /* ignore */ }
}
function save(next: State) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {
    // quota: drop thumbnails of oldest records
    const trimmed = { ...next, scans: next.scans.map((s, i) => (i > 40 ? { ...s, thumb: undefined } : s)) };
    state = trimmed;
    try { localStorage.setItem(KEY, JSON.stringify(trimmed)); } catch { /* give up */ }
  }
  subs.forEach((f) => f());
}

export function useStore(): State & { ready: boolean } {
  const [s, setS] = useState<State>(EMPTY);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    load();
    setS(state);
    setReady(true);
    const f = () => setS(state);
    subs.add(f);
    return () => { subs.delete(f); };
  }, []);
  return { ...s, ready };
}

export function binCount(s: State, cat: Category) {
  const since = s.emptiedAt[cat] ?? 0;
  return s.scans.filter((r) => r.confirmedCategory === cat && (r.confirmedAt ?? 0) > since).length;
}
export function binCounts(s: State) {
  return Object.fromEntries(BIN_CATEGORIES.map((c) => [c, binCount(s, c)])) as Record<Category, number>;
}
export const hasDemo = (s: State) => s.scans.some((r) => r.demo);

export function addScan(rec: ScanRecord) {
  load();
  save({ ...state, scans: [rec, ...state.scans] });
}

function checkAlert(cat: Category, before: number, after: number) {
  const warn = Math.ceil(BIN_CAPACITY * WARN_RATIO);
  if (after >= BIN_CAPACITY && before < BIN_CAPACITY) triggerBinAlert(cat, "full");
  else if (after >= warn && before < warn) triggerBinAlert(cat, "warning");
}

/** Idempotent: confirming the same scan twice never double-counts. */
export function confirmScan(id: string, cat: Category) {
  load();
  const rec = state.scans.find((r) => r.id === id);
  if (!rec || cat === "unknown") return false;
  if (rec.confirmedCategory === cat) return false;
  const before = binCount(state, cat);
  save({
    ...state,
    scans: state.scans.map((r) => (r.id === id ? { ...r, confirmedCategory: cat, confirmedAt: Date.now() } : r)),
  });
  checkAlert(cat, before, binCount(state, cat));
  return true;
}
export function unconfirmScan(id: string) {
  load();
  save({ ...state, scans: state.scans.map((r) => (r.id === id ? { ...r, confirmedCategory: undefined, confirmedAt: undefined } : r)) });
}
export function deleteScan(id: string) {
  load();
  save({ ...state, scans: state.scans.filter((r) => r.id !== id) });
}
export function emptyBin(cat: Category) {
  load();
  save({ ...state, emptiedAt: { ...state.emptiedAt, [cat]: Date.now() } });
}

const DEMO_ITEMS: [Category, string][] = [
  ["plastic", "PET bottle"], ["paper", "Cardboard box"], ["glass", "Glass jar"], ["metal", "Aluminium can"],
  ["organic", "Banana peel"], ["ewaste", "Old charger"], ["textile", "Cotton T-shirt"], ["hazardous", "AA battery"], ["general", "Crisp packet"],
];
export function seedDemo() {
  load();
  const now = Date.now();
  const day = 86400000;
  const recs: ScanRecord[] = [];
  for (let i = 0; i < 46; i++) {
    const [cat, name] = DEMO_ITEMS[(i * 7 + (i % 3)) % DEMO_ITEMS.length];
    const t = now - Math.floor((i / 46) * 33 * day) - (i % 5) * 3600000;
    const confirmed = i % 6 !== 0;
    recs.push({
      id: `demo-${i}-${t}`, createdAt: t, status: "classified", demo: true,
      result: { is_clear: true, category: cat, item_name: name, confidence: 0.8, explanation: "Demonstration record — not produced by AI.", recyclability: "depends", preparation: [], reuse: [], disposal: [], safety_notice: null },
      confirmedCategory: confirmed ? cat : undefined, confirmedAt: confirmed ? t + 60000 : undefined,
    });
  }
  save({ ...state, scans: [...state.scans.filter((r) => !r.demo), ...recs].sort((a, b) => b.createdAt - a.createdAt) });
}
export function clearDemo() {
  load();
  save({ ...state, scans: state.scans.filter((r) => !r.demo) });
}
