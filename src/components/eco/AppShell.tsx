import { Link, useLocation } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X, Bell, BellRing } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "./Logo";
import { NAV } from "./nav";
import { Button } from "@/components/ui/button";
import { requestNotifications } from "@/lib/alerts";
import { cn } from "@/lib/utils";

function NavList({ onNav }: { onNav?: () => void }) {
  const { pathname } = useLocation();
  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
        return (
          <Link key={to} to={to} onClick={onNav}
            className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-sidebar-accent text-primary shadow-glow" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground")}>
            <Icon className="h-4 w-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ title, eyebrow, heading, description, image, children, actions }: {
  title: string; eyebrow: string; heading: ReactNode; description: string; image: string; children: ReactNode; actions?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const enable = async () => {
    const p = await requestNotifications();
    if (p === "granted") toast.success("Bin alerts enabled", { description: "You'll get a notification and sound when a bin is almost full or full." });
    else if (p === "unsupported") toast("Notifications aren't supported here — in-app alerts with sound still work.");
    else toast("Notifications blocked — in-app alerts with sound still work.");
  };
  return (
    <div className="relative min-h-screen">
      {/* page background image */}
      <div className="fixed inset-0 -z-10" aria-hidden>
        <img src={image} alt="" className="h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-overlay-page" />
      </div>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-8 border-r bg-sidebar p-5 backdrop-blur-xl lg:flex">
        <Logo />
        <NavList />
        <div className="mt-auto rounded-2xl border bg-forest/60 p-4 text-xs text-muted-foreground">
          Data is stored on this device only. Impact figures are estimates, not measurements.
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-background/70 backdrop-blur-sm" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col gap-8 border-r bg-background p-5 animate-in slide-in-from-left">
            <div className="flex items-center justify-between"><Logo /><Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu"><X /></Button></div>
            <NavList onNav={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/40 px-4 backdrop-blur-xl sm:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu /></Button>
          <div className="lg:hidden"><Logo /></div>
          <p className="hidden text-sm text-muted-foreground lg:block">EcoTwin AI <span className="mx-2">/</span><span className="text-foreground">{title}</span></p>
          <Button variant="glass" size="sm" className="ml-auto" onClick={enable}><BellRing /> <span className="hidden sm:inline">Enable bin alerts</span><Bell className="sm:hidden" /></Button>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-8">
          <section className="py-12 sm:py-16">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary text-hero-shadow">{eyebrow}</p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-hero-shadow sm:text-6xl">{heading}</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground text-hero-shadow">{description}</p>
            {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
          </section>
          {children}
        </main>
      </div>
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("glass rounded-3xl p-5 shadow-card sm:p-6", className)}>{children}</div>;
}
