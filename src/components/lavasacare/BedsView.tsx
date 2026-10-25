"use client";

import { useMemo, useSyncExternalStore } from "react";
import { BED_REPORTS, formatHoursAgo, reportedAtLabel, type BedReport } from "@/lib/data";
import { BadgeCheck, BedDouble, Info, Phone, UserCheck } from "lucide-react";
import { DemoChip, Freshness, Reveal, SectionHead } from "./bits";
import { cn } from "@/lib/utils";

const OVERRIDES_KEY = "lavasacare-provider-overrides";

/** Subscribe to the localStorage "external store" (React-recommended pattern). */
function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}
function getSnapshot(): string | null {
  return window.localStorage.getItem(OVERRIDES_KEY);
}
function getServerSnapshot(): string | null {
  return null;
}

function bedTone(available: number, total: number) {
  const ratio = total === 0 ? 0 : available / total;
  if (ratio >= 0.25) return { bar: "from-emerald-400 to-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (ratio > 0) return { bar: "from-amber-400 to-amber-500", chip: "bg-amber-50 text-amber-700 border-amber-200" };
  return { bar: "from-rose-400 to-rose-500", chip: "bg-rose-50 text-rose-700 border-rose-200" };
}

export function BedsView() {
  // FR-18 loop: edits saved in the admin demo dashboard appear here with a
  // fresh timestamp (stored in this browser only — a demo mechanism).
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const reports = useMemo<BedReport[]>(() => {
    let overrides: Record<string, { beds?: { type: string; available: number; total: number }[]; savedAt?: number }> = {};
    try {
      overrides = raw ? JSON.parse(raw) : {};
    } catch {
      overrides = {};
    }
    return BED_REPORTS.map((r) => {
      const o = overrides[r.providerId];
      if (o?.beds) {
        return {
          ...r,
          rows: o.beds,
          reportedHoursAgo: o.savedAt ? (Date.now() - o.savedAt) / 3600000 : 0.1,
          reportedBy: "Facility duty manager (edited in demo dashboard)",
        };
      }
      return r;
    });
  }, [raw]);

  return (
    <div className="bg-mesh min-h-[calc(100vh-7rem)]">
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="pt-10">
          <SectionHead
            eyebrow="Bed availability"
            title={
              <>
                Hospital-reported beds,{" "}
                <span className="text-gradient">timestamped &amp; honest</span>
              </>
            }
            sub="Bed counts are shown only when supplied by an authorised hospital source, with the reporting facility and time always visible. Stale data is labelled — never presented as live (FR-11)."
          />
        </div>

        {/* FR-11 advisory */}
        <Reveal className="mt-6">
          <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50/80 p-4">
            <Info className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
            <p className="text-sm leading-relaxed text-brand-900">
              <strong>Always call the facility to confirm before travelling.</strong> Bed numbers can
              change within minutes. Data here is demo data; in production it comes from hospital
              systems or verified staff updates, each carrying its own timestamp (AC-09).
            </p>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {reports.map((r, i) => (
            <Reveal key={r.providerId} delay={i * 0.08}>
              <article className="flex h-full flex-col rounded-3xl border border-brand-100 bg-white p-6 shadow-sm card-hover">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-brand-600 text-white">
                      <BedDouble className="size-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-bold leading-tight tracking-tight text-ink">{r.facility}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                        <BadgeCheck className="size-3.5 text-brand-500" aria-hidden /> Authorised hospital report
                      </p>
                    </div>
                  </div>
                  <DemoChip />
                </div>

                <div className="mt-5 space-y-4">
                  {r.rows.map((row) => {
                    const tone = bedTone(row.available, row.total);
                    const pct = row.total === 0 ? 0 : Math.round((row.available / row.total) * 100);
                    return (
                      <div key={row.type}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-ink">{row.type} beds</span>
                          <span className={cn("rounded-full border px-2 py-0.5 text-xs font-bold", tone.chip)}>
                            {row.available} free / {row.total}
                          </span>
                        </div>
                        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", tone.bar)}
                            style={{ width: `${pct}%` }}
                            role="meter"
                            aria-label={`${row.type} beds available`}
                            aria-valuenow={row.available}
                            aria-valuemin={0}
                            aria-valuemax={row.total}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Timestamp + source (FR-11 / AC-09) */}
                <div className="mt-6 rounded-2xl bg-muted/60 p-4 text-xs leading-relaxed text-muted-foreground">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="size-3.5 text-brand-400" aria-hidden />
                      {r.reportedBy}
                    </span>
                    <Freshness hoursAgo={r.reportedHoursAgo} />
                  </div>
                  <p className="mt-2">
                    Reported <strong className="text-ink">{reportedAtLabel(r.reportedHoursAgo)}</strong>{" "}
                    ({formatHoursAgo(r.reportedHoursAgo)}) · Source: facility-reported update (demo)
                  </p>
                </div>

                <a
                  href={`tel:${r.phone.replace(/\s/g, "")}`}
                  className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-500 text-sm font-bold text-white transition hover:bg-brand-600"
                >
                  <Phone className="size-4" aria-hidden /> Call facility to confirm
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
