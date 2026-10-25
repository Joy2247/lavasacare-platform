"use client";

import { useLavasa, type ViewKey } from "@/lib/store";
import { DEMO_NOTE, EMERGENCY, SERVICE_AREA } from "@/lib/data";
import { Activity, ExternalLink, PhoneCall } from "lucide-react";

const QUICK: { key: ViewKey; label: string }[] = [
  { key: "find", label: "Find care & providers" },
  { key: "appointments", label: "Request an appointment" },
  { key: "medicine", label: "Medicine delivery request" },
  { key: "packages", label: "Health checkup packages" },
  { key: "beds", label: "Bed availability" },
  { key: "coverage", label: "Service coverage" },
  { key: "contact", label: "Contact & support" },
  { key: "admin", label: "Provider admin (demo)" },
];

export function Footer() {
  const setView = useLavasa((s) => s.setView);

  return (
    <footer className="mt-auto border-t border-border bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand + disclaimers */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Activity className="size-[18px]" aria-hidden />
              </span>
              <div className="leading-tight">
                <p className="text-[15px] font-bold tracking-[-0.01em] text-ink">
                  Lavasa<span className="text-gradient">Care</span>
                </p>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {SERVICE_AREA}
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A single point of access to participating healthcare providers in Lavasa — appointment
              requests, medicine delivery enquiries, checkup packages, bed updates and verified
              service information.
            </p>
            <p className="mt-4 border-l-2 border-slate-300 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
              {DEMO_NOTE}
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/60">Services</p>
            <ul className="mt-4 space-y-2.5">
              {QUICK.map((q) => (
                <li key={q.key}>
                  <button
                    onClick={() => {
                      setView(q.key);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-sm font-medium text-muted-foreground transition hover:text-brand-600"
                  >
                    {q.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Emergency + info */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/60">
              Emergency & info
            </p>
            <div className="mt-4 space-y-3">
              <a
                href={`tel:${EMERGENCY.ambulance}`}
                className="flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50/60 px-4 py-3 transition-colors hover:bg-rose-50"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                  <PhoneCall className="size-4" aria-hidden />
                  Ambulance — {EMERGENCY.ambulance}
                </span>
                <ExternalLink className="size-4 text-rose-400" aria-hidden />
              </a>
              <a
                href={`tel:${EMERGENCY.national}`}
                className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3 transition-colors hover:bg-brand-50/60"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-brand-700">
                  <PhoneCall className="size-4" aria-hidden />
                  National — {EMERGENCY.national}
                </span>
                <ExternalLink className="size-4 text-brand-300" aria-hidden />
              </a>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              LavasaCare is a directory &amp; request platform — not a hospital, pharmacy or
              dispatch centre. Requests are confirmed only by the responsible provider. Map links
              open third-party map services and do not establish affiliation or operating status
              (FR-13).
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} LavasaCare · Front-end prototype v1.1</p>
          <p>
            Refined from the SRS palette —{" "}
            <span className="inline-flex items-center gap-1">
              <span className="size-2.5 rounded-full bg-[#227454]" /> Emerald
              <span className="ml-2 size-2.5 rounded-full bg-[#5CAB8A]" /> Sage
              <span className="ml-2 size-2.5 rounded-full bg-[#BDE0CD]" /> Mint
              <span className="ml-2 size-2.5 rounded-full bg-[#E9E4D2] ring-1 ring-black/10" /> Sand
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
