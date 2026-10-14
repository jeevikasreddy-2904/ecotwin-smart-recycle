import { BIN_CAPACITY, CAT, WARN_RATIO, type Category } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function Bin({ cat, count, selected, onClick, compact }: { cat: Category; count: number; selected?: boolean; onClick?: () => void; compact?: boolean }) {
  const m = CAT[cat];
  const Icon = m.icon;
  const ratio = Math.min(1, count / BIN_CAPACITY);
  const full = count >= BIN_CAPACITY;
  const warn = !full && ratio >= WARN_RATIO;
  return (
    <button type="button" onClick={onClick}
      aria-label={`${m.label} bin: ${count} of ${BIN_CAPACITY} items${full ? ", full" : warn ? ", almost full" : ""}`}
      className={cn("group flex flex-col items-center gap-2 rounded-2xl p-2 transition-transform hover:-translate-y-1 focus-visible:-translate-y-1", selected && "-translate-y-1")}>
      {/* lid */}
      <div className={cn("h-2.5 rounded-t-lg border border-b-0 bg-elevated", compact ? "w-14" : "w-20", selected && "border-primary")} />
      <div className={cn("relative overflow-hidden rounded-b-2xl rounded-t-md border-2 bg-forest/70",
        compact ? "h-24 w-12" : "h-36 w-16 sm:h-40 sm:w-[4.5rem]",
        selected ? "border-primary shadow-glow" : m.border,
        full && "border-destructive animate-pulse-ring", warn && "border-warning")}>
        <div className={cn("absolute inset-x-0 bottom-0 transition-[height] duration-700 ease-out", m.fill)} style={{ height: `${ratio * 100}%`, opacity: 0.85 }}>
          <div className="absolute inset-x-0 top-0 h-1.5 bg-foreground/30" />
        </div>
        <div className="relative grid h-full place-items-center">
          <Icon className={cn("drop-shadow", compact ? "h-5 w-5" : "h-7 w-7", ratio > 0.45 ? "text-background" : m.text)} />
        </div>
        {(full || warn) && <span className={cn("absolute right-1 top-1 h-2.5 w-2.5 rounded-full", full ? "bg-destructive" : "bg-warning")} />}
      </div>
      <div className="text-center">
        <p className={cn("font-semibold leading-tight", compact ? "text-[11px]" : "text-xs sm:text-sm")}>{m.label}</p>
        <p className={cn("text-[11px] tabular-nums", full ? "text-destructive" : warn ? "text-warning" : "text-muted-foreground")}>{count}/{BIN_CAPACITY}{full ? " · Full" : warn ? " · Almost full" : ""}</p>
      </div>
    </button>
  );
}
