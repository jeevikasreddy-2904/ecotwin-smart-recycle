import { Link } from "@tanstack/react-router";
import { Leaf, RefreshCw } from "lucide-react";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-extrabold tracking-tight" aria-label="EcoTwin AI home">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
        <RefreshCw className="absolute h-7 w-7 opacity-30" strokeWidth={2.5} />
        <Leaf className="h-4 w-4" strokeWidth={2.75} />
      </span>
      <span>EcoTwin <span className="text-gradient-brand">AI</span></span>
    </Link>
  );
}
