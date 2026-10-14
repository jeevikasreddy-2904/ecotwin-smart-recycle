import { CAT, type Category } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function CategoryChip({ cat, className }: { cat: Category; className?: string }) {
  const m = CAT[cat];
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", m.bg, m.border, m.text, className)}>
      <Icon className="h-3.5 w-3.5" /> {m.label}
    </span>
  );
}
