"use client";

import { useMemo, useState } from "react";
import { COVERAGE_AREAS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  BadgeCheck,
  Clock4,
  Info,
  MapPin,
  MapPinned,
  Search,
  ShieldQuestion,
} from "lucide-react";
import { DemoChip, EmptyState, Reveal, SectionHead } from "./bits";
import { cn } from "@/lib/utils";

export function CoverageView() {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return COVERAGE_AREAS;
    return COVERAGE_AREAS.filter(
      (c) => c.area.toLowerCase().includes(needle) || c.pin.includes(needle)
    );
  }, [q]);

  return (
    <div className="bg-mesh min-h-[calc(100vh-7rem)]">
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="pt-10">
          <SectionHead
            eyebrow="Service coverage"
            title={
              <>
                Where do we <span className="text-gradient">actually</span> reach?
              </>
            }
            sub="Search by area name or PIN code. Coverage is shown only where providers have verified it — we never promise coverage that isn't confirmed (FR-12)."
          />
        </div>

        {/* Search */}
        <Reveal className="mt-8">
          <form
            onSubmit={(e) => e.preventDefault()}
            role="search"
            className="glass flex items-center gap-2 rounded-full p-2"
          >
            <Search className="ml-4 size-5 shrink-0 text-brand-400" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Enter area (e.g. “Dasve”) or PIN code (e.g. 412112)…"
              aria-label="Search coverage by area or PIN code"
              className="h-11 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/70"
            />
            {q ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setQ("")} className="rounded-full">
                Clear
              </Button>
            ) : null}
          </form>
        </Reveal>

        {/* Legend + notice */}
        <Reveal className="mt-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-brand-100 bg-white p-4 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="size-4 text-emerald-500" aria-hidden /> Verified — provider has
              confirmed coverage
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldQuestion className="size-4 text-amber-500" aria-hidden /> Pending — being
              verified, not promised
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <Info className="size-4 text-brand-500" aria-hidden /> Map links elsewhere on the site open
              third-party maps and imply no affiliation (FR-13)
            </span>
          </div>
        </Reveal>

        {results.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={<MapPinned className="size-6" aria-hidden />}
              title="No coverage data for that search"
              sub="We don't guess coverage. If your area isn't listed, it hasn't been verified with a provider yet — try a nearby area or PIN code, or contact us to request it."
              action={
                <Button onClick={() => setQ("")} className="rounded-full bg-brand-500 hover:bg-brand-600">
                  Show all areas
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {results.map((c, i) => (
              <Reveal key={c.area} delay={Math.min(i * 0.05, 0.3)}>
                <article
                  className={cn(
                    "h-full rounded-3xl border bg-white p-6 card-hover",
                    c.status === "verified" ? "border-brand-100" : "border-dashed border-amber-300"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex size-11 items-center justify-center rounded-2xl text-white shadow-md",
                          c.status === "verified"
                            ? "bg-brand-600"
                            : "bg-gradient-to-br from-amber-400 to-amber-500"
                        )}
                      >
                        <MapPin className="size-5" aria-hidden />
                      </span>
                      <div>
                        <h3 className="font-bold tracking-tight text-ink">{c.area}</h3>
                        <p className="text-xs font-semibold text-muted-foreground">PIN {c.pin}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                        c.status === "verified"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      )}
                    >
                      {c.status === "verified" ? (
                        <BadgeCheck className="size-3.5" aria-hidden />
                      ) : (
                        <Clock4 className="size-3.5" aria-hidden />
                      )}
                      {c.status === "verified" ? "Verified" : "Pending"}
                    </span>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {c.services.map((s) => (
                      <li
                        key={`${c.area}-${s.type}-${s.provider}`}
                        className="flex items-center justify-between rounded-xl bg-muted/50 px-3.5 py-2.5 text-sm"
                      >
                        <span className="font-bold text-ink">{s.type}</span>
                        <span className="max-w-[60%] truncate text-right text-xs font-semibold text-muted-foreground">
                          {s.provider}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {c.status === "pending" ? (
                    <p className="mt-4 text-xs leading-relaxed text-amber-700">
                      Coverage here is being verified with providers. It is shown only to indicate
                      work in progress — not as a service promise (FR-12).
                    </p>
                  ) : null}
                </article>
              </Reveal>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <DemoChip label="Coverage list is demo data" />
        </div>
      </div>
    </div>
  );
}
