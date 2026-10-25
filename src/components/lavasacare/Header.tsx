"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLavasa, type ViewKey } from "@/lib/store";
import { EMERGENCY, SERVICE_AREA } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Activity,
  CalendarPlus,
  ChevronRight,
  HandCoins,
  LayoutDashboard,
  LifeBuoy,
  MapPinned,
  Menu,
  PhoneCall,
  Pill,
  Search,
  Stethoscope,
  Waves,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV: { key: ViewKey; label: string; icon: typeof Activity }[] = [
  { key: "home", label: "Home", icon: Activity },
  { key: "find", label: "Find Care", icon: Stethoscope },
  { key: "appointments", label: "Appointments", icon: CalendarPlus },
  { key: "medicine", label: "Medicine", icon: Pill },
  { key: "packages", label: "Packages", icon: HandCoins },
  { key: "beds", label: "Beds", icon: Waves },
  { key: "coverage", label: "Coverage", icon: MapPinned },
  { key: "contact", label: "Contact", icon: LifeBuoy },
];

export function Header() {
  const { view, setView, goSearch, adminAuthed } = useLavasa();
  const [scrolled, setScrolled] = useState(false);
  const [emgOpen, setEmgOpen] = useState(false);
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    goSearch(q.trim());
    setMobileOpen(false);
  };

  const navTo = (v: ViewKey) => {
    setView(v);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Emergency microbar (FR-14: emergency guidance always visible) */}
      <div className="relative z-50 flex items-center justify-center gap-2 bg-rose-700 px-4 py-1.5 text-white">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-50" />
          <span className="relative inline-flex size-1.5 rounded-full bg-white" />
        </span>
        <p className="truncate text-center text-[11px] font-medium tracking-wide sm:text-xs">
          Medical emergency? Call {EMERGENCY.ambulance} (ambulance) · {EMERGENCY.national} (national) —
          <span className="hidden opacity-75 sm:inline"> LavasaCare is not a dispatch centre</span>
        </p>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          scrolled
            ? "border-b border-border bg-white/90 shadow-[0_1px_2px_rgba(10,38,27,0.04)] backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          {/* Brand */}
          <button
            onClick={() => navTo("home")}
            className="group flex items-center gap-2.5"
            aria-label="LavasaCare home"
          >
            <span className="relative flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white transition-colors group-hover:bg-brand-700">
              <span
                aria-hidden
                className="logo-ring absolute inset-0 rounded-lg border border-brand-400"
              />
              <Activity className="logo-icon relative size-[18px]" aria-hidden />
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[15px] font-bold tracking-[-0.01em] text-ink">
                Lavasa<span className="text-gradient">Care</span>
              </span>
              <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:block">
                {SERVICE_AREA}
              </span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="ml-4 hidden flex-1 items-center gap-1 xl:flex" aria-label="Primary">
            {NAV.map((item) => (
              <button
                key={item.key}
                onClick={() => navTo(item.key)}
                className={cn(
                  "relative whitespace-nowrap rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors",
                  view === item.key
                    ? "text-brand-700"
                    : "text-ink/65 hover:bg-brand-50 hover:text-brand-700"
                )}
              >
                {item.label}
                {view === item.key && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-600"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Search + actions */}
          <div className="ml-auto flex items-center gap-2">
            <form onSubmit={submitSearch} className="relative hidden 2xl:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-400" aria-hidden />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search doctors, services…"
                aria-label="Search LavasaCare"
                className="h-9 w-52 rounded-lg border border-border bg-white pl-9 pr-3 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:w-64 focus:border-brand-300 focus:ring-4 focus:ring-brand-100/60"
              />
            </form>

            <Button
              size="sm"
              variant="outline"
              onClick={() => navTo("admin")}
              className="hidden h-9 gap-1.5 rounded-lg border-border bg-white font-medium text-ink/75 hover:bg-brand-50 hover:text-brand-700 sm:inline-flex"
            >
              <LayoutDashboard className="size-4" aria-hidden />
              Admin
            </Button>

            <Button
              size="sm"
              onClick={() => setEmgOpen(true)}
              className="h-9 gap-1.5 rounded-lg bg-rose-600 font-semibold shadow-none hover:bg-rose-700"
            >
              <PhoneCall className="size-4" aria-hidden />
              SOS
            </Button>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="size-10 rounded-xl border-brand-200 xl:hidden" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] overflow-y-auto rounded-l-3xl">
                <SheetTitle className="flex items-center gap-2 text-ink">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                    <Activity className="size-4" aria-hidden />
                  </span>
                  LavasaCare
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Navigation menu for LavasaCare services
                </SheetDescription>
                <form onSubmit={submitSearch} className="relative mt-4">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-400" aria-hidden />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search LavasaCare…"
                    aria-label="Search LavasaCare"
                    className="h-11 w-full rounded-xl border border-brand-100 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                  />
                </form>
                <nav className="mt-4 flex flex-col gap-1" aria-label="Mobile">
                  {NAV.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => navTo(item.key)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                        view === item.key
                          ? "bg-brand-50 text-brand-600"
                          : "text-ink/75 hover:bg-muted"
                      )}
                    >
                      <item.icon className="size-4" aria-hidden />
                      {item.label}
                      <ChevronRight className="ml-auto size-4 opacity-40" aria-hidden />
                    </button>
                  ))}
                  <button
                    onClick={() => navTo("admin")}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink/75 transition hover:bg-muted"
                  >
                    <LayoutDashboard className="size-4" aria-hidden />
                    Provider Admin {adminAuthed ? "· signed in" : ""}
                  </button>
                </nav>
                <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-xs leading-relaxed text-rose-700">
                  <strong>Emergency?</strong> Call {EMERGENCY.ambulance} / {EMERGENCY.national} now.
                  LavasaCare is not a dispatch centre.
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
