import { toast } from "sonner";
import { CAT, type Category } from "./categories";

let ctx: AudioContext | null = null;
function audio() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(c: AudioContext, start: number, from: number, to: number, dur: number, type: OscillatorType, vol = 0.18) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(from, start);
  o.frequency.linearRampToValueAtTime(to, start + dur);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(vol, start + 0.02);
  g.gain.linearRampToValueAtTime(0, start + dur);
  o.connect(g).connect(c.destination);
  o.start(start);
  o.stop(start + dur + 0.02);
}

export function playSound(kind: "warning" | "full") {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + 0.02;
  if (kind === "warning") {
    tone(c, t, 880, 880, 0.18, "sine");
    tone(c, t + 0.28, 660, 660, 0.22, "sine");
  } else {
    for (let i = 0; i < 4; i++) tone(c, t + i * 0.55, 600, 1100, 0.5, "sawtooth", 0.12);
  }
}

export async function requestNotifications() {
  if (typeof Notification === "undefined") return "unsupported" as const;
  if (Notification.permission === "default") return await Notification.requestPermission();
  return Notification.permission;
}

export function triggerBinAlert(cat: Category, kind: "warning" | "full", demo = false) {
  const label = CAT[cat].label;
  const title = kind === "full" ? `${label} bin is full` : `${label} bin is almost full`;
  const body = kind === "full" ? "Empty the bin in the Digital Twin before adding more items." : "It has reached 80% capacity. Plan to empty it soon.";
  playSound(kind);
  const opts = { description: demo ? `${body} (demo alert)` : body, duration: 7000 };
  if (kind === "full") toast.error(title, opts);
  else toast.warning(title, opts);
  try {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(`EcoTwin AI — ${title}`, { body, tag: `bin-${cat}-${kind}` });
    }
  } catch { /* some mobile browsers only allow notifications from a service worker */ }
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(kind === "full" ? [300, 120, 300, 120, 300] : [150, 80, 150]);
}
