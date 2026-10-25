"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLavasa } from "@/lib/store";
import {
  DOCTORS,
  PROVIDERS,
  SPECIALTIES,
  formatHoursAgo,
  type ProviderType,
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DemoChip, EmptyState, Reveal, SectionHead } from "./bits";
import {
  BadgeCheck,
  Building2,
  CalendarPlus,
  Clock,
  ExternalLink,
  FlaskConical,
  Languages,
  MapPin,
  Phone,
  Pill,
  Search,
  Stethoscope,
  Siren,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_META: Record<ProviderType, { icon: typeof Building2; label: string; tone: string }> = {
  hospital: { icon: Building2, label: "Hospital", tone: "bg-brand-500" },
  clinic: { icon: Stethoscope, label: "Clinic", tone: "bg-brand-400" },
  pharmacy: { icon: Pill, label: "Pharmacy", tone: "bg-emerald-500" },
  lab: { icon: FlaskConical, label: "Laboratory", tone: "bg-teal-600" },
  ambulance: { icon: Siren, label: "Ambulance", tone: "bg-rose-500" },
};

const TYPE_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "hospital", label: "Hospitals" },
  { value: "clinic", label: "Clinics" },
  { value: "pharmacy", label: "Pharmacies" },
  { value: "lab", label: "Laboratories" },
  { value: "ambulance", label: "Ambulance" },
];

export function FindView() {
  const { searchQuery, goSearch, setView, setAppointmentPrefill } = useLavasa();
  const [q, setQ] = useState(searchQuery);
  const [type, setType] = useState("all");
  const [spec, setSpec] = useState("all");
  const [tab, setTab] = useState("providers");

  const needle = q.trim().toLowerCase();

  const providers = useMemo(() => {
    return PROVIDERS.filter((p) => {
      const typeOk = type === "all" || p.type === type;
      const text = `${p.name} ${p.area} ${p.address} ${p.services.join(" ")} ${p.type}`.toLowerCase();
      return typeOk && (!needle || text.includes(needle));
    });
  }, [needle, type]);

  const doctors = useMemo(() => {
    return DOCTORS.filter((d) => {
      const specOk = spec === "all" || d.specialty === spec;
      const text = `${d.name} ${d.specialty} ${d.qualifications} ${d.providerName} ${d.languages.join(" ")}`.toLowerCase();
      return specOk && (!needle || text.includes(needle));
    });
  }, [needle, spec]);

  const filteredProviders = useMemo(() => {
    // When a specialty search is active, also surface doctors' facilities
    return providers;
  }, [providers]);

  const hasFilters = needle || type !== "all" || spec !== "all";

  function reset() {
    setQ("");
    setType("all");
    setSpec("all");
  }

  function requestWithDoctor(doctorId: string) {
    const d = DOCTORS.find((x) => x.id === doctorId);
    if (!d) return;
    setAppointmentPrefill({
      specialty: d.specialty,
      providerId: d.providerId,
      providerName: d.providerName,
      doctorId: d.id,
      doctorName: d.name,
    });
    setView("appointments");
  }

  return (
    <div className="bg-mesh min-h-[calc(100vh-7rem)]">
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="pt-10">
          <SectionHead
            eyebrow="Find care"
            title={
              <>
                Search <span className="text-gradient">providers, doctors & services</span>
              </>
            }
            sub="Browse the participating directory, or search by name, specialty, service or facility. Availability shown on doctor profiles is timestamped — always confirm with the provider."
          />
        </div>

        {/* Search + filters (FR-02) */}
        <Reveal className="mt-8">
          <div className="glass rounded-3xl p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <form
                className="relative flex-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  goSearch(q);
                }}
                role="search"
              >
                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-brand-400" aria-hidden />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search providers, doctors, services, packages…"
                  aria-label="Search directory"
                  className="h-12 w-full rounded-2xl border border-brand-100 bg-white pl-12 pr-10 text-[15px] outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                />
                {q ? (
                  <button
                    type="button"
                    onClick={() => setQ("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </form>

              <div className="flex gap-3">
                <Select value={type} onValueChange={(v) => { setType(v); setTab("providers"); }}>
                  <SelectTrigger className="h-12 w-[150px] rounded-2xl border-brand-100 bg-white" aria-label="Filter provider type">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_FILTERS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={spec} onValueChange={(v) => { setSpec(v); setTab("doctors"); }}>
                  <SelectTrigger className="h-12 w-[180px] rounded-2xl border-brand-100 bg-white" aria-label="Filter specialty">
                    <SelectValue placeholder="Specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All specialties</SelectItem>
                    {SPECIALTIES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="rounded-full bg-brand-50 p-1">
                  <TabsTrigger value="providers" className="rounded-full px-4 data-[state=active]:bg-white">
                    Providers <span className="ml-1 text-xs text-muted-foreground">{filteredProviders.length}</span>
                  </TabsTrigger>
                  <TabsTrigger value="doctors" className="rounded-full px-4 data-[state=active]:bg-white">
                    Doctors <span className="ml-1 text-xs text-muted-foreground">{doctors.length}</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {hasFilters ? (
                <Button variant="ghost" size="sm" onClick={reset} className="rounded-full text-brand-600 hover:bg-brand-50">
                  <X className="mr-1 size-4" aria-hidden /> Clear filters
                </Button>
              ) : null}
            </div>
          </div>
        </Reveal>

        {/* PROVIDERS */}
        {tab === "providers" ? (
          filteredProviders.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                icon={<Search className="size-6" aria-hidden />}
                title="No providers match your search"
                sub="Try a different keyword — like a service (“delivery”, “X-ray”), an area (“Dasve”) or a provider type. Or clear the filters to see the full directory."
                action={
                  <Button onClick={reset} className="rounded-full bg-brand-500 hover:bg-brand-600">
                    Clear all filters
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredProviders.map((p, i) => {
                const meta = TYPE_META[p.type];
                return (
                  <Reveal key={p.id} delay={Math.min(i * 0.05, 0.3)}>
                    <article className="flex h-full flex-col rounded-3xl border border-brand-100 bg-white p-6 card-hover">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className={cn("flex size-11 items-center justify-center rounded-2xl text-white shadow-md", meta.tone)}>
                            <meta.icon className="size-5" aria-hidden />
                          </span>
                          <div>
                            <h3 className="flex items-center gap-1.5 font-bold leading-tight tracking-tight text-ink">
                              {p.name}
                              {p.verified && (
                                <BadgeCheck className="size-4 shrink-0 text-brand-500" aria-label="Verified provider" />
                              )}
                            </h3>
                            <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-brand-500">
                              {meta.label} · {p.area}
                            </p>
                          </div>
                        </div>
                        <DemoChip />
                      </div>

                      <dl className="mt-4 space-y-2 text-sm">
                        <div className="flex gap-2">
                          <MapPin className="mt-0.5 size-4 shrink-0 text-brand-400" aria-hidden />
                          <dd className="text-muted-foreground">{p.address}</dd>
                        </div>
                        <div className="flex gap-2">
                          <Clock className="mt-0.5 size-4 shrink-0 text-brand-400" aria-hidden />
                          <dd className="text-muted-foreground">{p.hours}</dd>
                        </div>
                      </dl>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {p.services.map((s) => (
                          <span key={s} className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto flex gap-2 pt-5">
                        <a
                          href={`tel:${p.phone.replace(/\s/g, "")}`}
                          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-brand-500 text-sm font-bold text-white transition hover:bg-brand-600"
                        >
                          <Phone className="size-4" aria-hidden /> Call
                        </a>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.mapQuery)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-brand-200 text-sm font-bold text-brand-700 transition hover:bg-brand-50"
                          title="Opens a third-party map search — maps do not establish affiliation or operating status (FR-13)"
                        >
                          <ExternalLink className="size-4" aria-hidden /> Map
                        </a>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )
        ) : null}

        {/* DOCTORS */}
        {tab === "doctors" ? (
          doctors.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                icon={<Stethoscope className="size-6" aria-hidden />}
                title="No doctors match your search"
                sub="Try a specialty like “Paediatrics” or “Cardiology”, a language, or a doctor's name. Or clear the filters to browse every profile."
                action={
                  <Button onClick={reset} className="rounded-full bg-brand-500 hover:bg-brand-600">
                    Clear all filters
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {doctors.map((d, i) => (
                <Reveal key={d.id} delay={Math.min(i * 0.05, 0.3)}>
                  <motion.article
                    whileHover={{ y: -6 }}
                    className="flex h-full flex-col rounded-3xl border border-brand-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl hover:shadow-brand-100"
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-lg font-semibold text-white">
                        {d.name.replace("Dr. ", "").charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-bold tracking-tight text-ink">{d.name}</h3>
                        <p className="mt-0.5 text-xs font-semibold leading-relaxed text-muted-foreground">
                          {d.qualifications}
                        </p>
                        <span className="mt-1.5 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-700">
                          {d.specialty}
                        </span>
                      </div>
                      <div className="ml-auto"><DemoChip /></div>
                    </div>

                    <dl className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <BuildingIcon aria-hidden />
                        <dd>{d.providerName} · {d.experienceYears} yrs exp.</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <Languages className="size-4 shrink-0 text-brand-400" aria-hidden />
                        <dd>{d.languages.join(" · ")}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 shrink-0 text-brand-400" aria-hidden />
                        <dd>{d.weeklySchedule.join(" · ")}</dd>
                      </div>
                    </dl>

                    {/* FR-07 availability with timestamp */}
                    <div className="mt-4 rounded-2xl bg-brand-50/70 p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                          Next available slots
                        </p>
                        <p className="text-[10px] font-semibold text-muted-foreground" title="Availability timestamp (FR-07)">
                          Updated {formatHoursAgo(d.lastUpdatedHoursAgo)}
                        </p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {d.nextSlots.map((s) => (
                          <span key={s} className="rounded-full border border-brand-200 bg-white px-2.5 py-1 text-[11px] font-bold text-brand-700">
                            {s}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
                        Demo slots — contact the provider to confirm before travelling (FR-07).
                      </p>
                    </div>

                    <div className="mt-auto flex gap-2 pt-5">
                      <Button
                        onClick={() => requestWithDoctor(d.id)}
                        className="h-10 flex-1 rounded-full bg-brand-600 font-semibold shadow-none hover:bg-brand-700"
                      >
                        <CalendarPlus className="mr-2 size-4" aria-hidden /> Request
                      </Button>
                      <a
                        href={`tel:${PROVIDERS.find((p) => p.id === d.providerId)?.phone.replace(/\s/g, "") ?? ""}`}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-brand-200 px-4 text-sm font-bold text-brand-700 transition hover:bg-brand-50"
                      >
                        <Phone className="size-4" aria-hidden /> Call
                      </a>
                    </div>
                  </motion.article>
                </Reveal>
              ))}
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}

function BuildingIcon(props: React.SVGProps<SVGSVGElement>) {
  return <Building2 className="size-4 shrink-0 text-brand-400" {...props} />;
}
