"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLavasa, type ViewKey } from "@/lib/store";
import {
  EMERGENCY,
  DOCTORS,
  PACKAGES,
  PROVIDERS,
  SPECIALTIES,
  POPULAR_SEARCHES,
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Counter, DemoChip, EcgLine, Reveal, SectionHead } from "./bits";
import HeroWaves from "./HeroWaves";
import {
  ArrowRight,
  BedDouble,
  CalendarPlus,
  HandCoins,
  MapPinned,
  PhoneCall,
  Pill,
  Search,
  ShieldCheck,
  Stethoscope,
  Siren,
  BadgeCheck,
  Eye,
  Lock,
  ChevronDown,
  Activity,
} from "lucide-react";

const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0" aria-hidden="true" />,
});

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const SERVICES: {
  key: ViewKey;
  icon: typeof Activity;
  title: string;
  desc: string;
  span: string;
  img?: string;
  imgAlt?: string;
}[] = [
  {
    key: "appointments",
    icon: CalendarPlus,
    title: "Appointment requests",
    desc: "Pick a specialty, doctor, date and slot — the provider reviews and confirms. A request is never an automatic confirmation.",
    span: "md:col-span-3",
    img: "/images/doctor-clinic.jpg",
    imgAlt: "A doctor at a participating clinic",
  },
  {
    key: "medicine",
    icon: Pill,
    title: "Medicine delivery",
    desc: "Send a medicine request that routes to a participating pharmacy. Honest statuses — nothing is promised before pharmacy confirmation.",
    span: "md:col-span-3",
    img: "/images/pharmacist.jpg",
    imgAlt: "A pharmacist checking stock at a partner pharmacy",
  },
  {
    key: "packages",
    icon: HandCoins,
    title: "Health checkup packages",
    desc: "Compare verified packages with inclusions, prices, prep steps and last-updated times. Enquire in two clicks.",
    span: "md:col-span-2",
  },
  {
    key: "beds",
    icon: BedDouble,
    title: "Bed availability",
    desc: "Hospital-reported General / ICU / Oxygen beds with reporting time and staleness labels.",
    span: "md:col-span-2",
  },
  {
    key: "find",
    icon: Stethoscope,
    title: "Doctors & directory",
    desc: "Verified profiles of hospitals, clinics, pharmacies, labs, ambulances and doctors.",
    span: "md:col-span-2",
  },
];

const TRUST = [
  {
    icon: BadgeCheck,
    title: "Verified providers only",
    desc: "Only participating hospitals, clinics, pharmacies and labs that agreed to publish information appear here — nothing scraped, nothing guessed.",
  },
  {
    icon: Eye,
    title: "Honest, timestamped data",
    desc: "Availability and bed data carry update times. Stale or unverified information is clearly labelled, never presented as live.",
  },
  {
    icon: ShieldCheck,
    title: "Request ≠ confirmation",
    desc: "Every request shows its real state. Only authorised provider staff can confirm, decline or reschedule — with an audit trail (FR-17).",
  },
  {
    icon: Lock,
    title: "Privacy-first by design",
    desc: "Only minimum necessary details are collected. The prototype stores demo submissions in a local database and never shares them (FR-06 / NFR-06).",
  },
];

const LAVASA_POINTS = [
  "Coverage checked by area and PIN code — never assumed",
  "Ambulance partners mapped to the hill roads they actually drive",
  "One honest, timestamped status for every request, in every season",
];

const STEPS = [
  {
    n: "01",
    t: "Discover & request",
    d: "Search verified providers and doctors, check timestamped availability, then submit a request with your preferred slot, area or package.",
  },
  {
    n: "02",
    t: "Provider reviews",
    d: "Authorised staff at the participating provider review your request. You can watch its status — Submitted, Under Review, Confirmed or Declined.",
  },
  {
    n: "03",
    t: "Confirmed, honestly",
    d: "Only the provider can confirm. You always receive a unique reference number, and statuses never pretend a request is booked before it is.",
  },
];

export function HomeView() {
  const { setView, goSearch } = useLavasa();
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    goSearch(q.trim());
  };

  return (
    <div>
      {/* ============================== HERO ============================== */}
      <section className="bg-mesh relative overflow-hidden" aria-label="Welcome">
        <div className="bg-grid-faint absolute inset-0" aria-hidden="true" />
        {/* ambient brand blooms — quiet depth behind the instrument */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-bloom absolute -right-32 top-10 size-[36rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(92,171,138,0.32),transparent_62%)] blur-2xl" />
          <div className="animate-bloom-slow absolute -left-44 -top-28 size-[32rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(189,224,205,0.5),transparent_65%)] blur-2xl" />
          <div className="animate-bloom-slow absolute bottom-[-9rem] left-1/3 size-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(233,228,210,0.55),transparent_65%)] blur-2xl" />
        </div>
        {/* flowing wave ribbons — quiet brand-green drift behind the scene */}
        <HeroWaves />
        <HeroScene />

        <div className="relative mx-auto flex min-h-[calc(100svh-7rem)] max-w-7xl flex-col justify-center px-4 pb-20 pt-10 sm:px-6">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            <motion.div variants={item} className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-700">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-500 opacity-60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-brand-600" />
                </span>
                Serving Lavasa, Maharashtra
              </span>
              <span className="hidden h-3 w-px bg-brand-200 sm:block" aria-hidden="true" />
              <DemoChip label="Prototype · demo data" />
            </motion.div>

            <motion.h1
              variants={item}
              className="mt-6 text-balance text-[2.6rem] font-bold leading-[1.05] tracking-[-0.03em] text-ink sm:text-6xl lg:text-[3.9rem]"
            >
              Care that knows <span className="text-brand-600">your neighbourhood.</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 max-w-lg text-pretty text-[17px] leading-relaxed text-ink/65"
            >
              One calm, honest place to reach participating hospitals, clinics, pharmacies, labs
              and ambulance services in Lavasa — and to request appointments, medicines and
              checkups with real status you can trust.
            </motion.p>

            {/* Search (FR-01 / FR-02) */}
            <motion.form
              variants={item}
              onSubmit={submit}
              className="glass mt-8 flex items-center gap-2 rounded-xl p-1.5 pl-3.5"
              role="search"
            >
              <Search className="size-[18px] shrink-0 text-brand-500" aria-hidden />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search doctors, services, packages, beds…"
                aria-label="Search doctors, services, packages and facilities"
                className="h-11 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/70"
              />
              <Button
                type="submit"
                className="h-11 shrink-0 rounded-lg bg-brand-600 px-5 font-semibold shadow-none transition-colors hover:bg-brand-700"
              >
                Search
                <ArrowRight className="ml-1.5 size-4" aria-hidden />
              </Button>
            </motion.form>

            <motion.div variants={item} className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-2">
              <span className="text-xs font-medium text-muted-foreground">Popular:</span>
              {POPULAR_SEARCHES.map((s) => (
                <button
                  key={s}
                  onClick={() => goSearch(s)}
                  className="rounded-md px-2 py-1 text-[13px] font-medium text-brand-700 transition-colors hover:bg-brand-50"
                >
                  {s}
                </button>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={() => setView("appointments")}
                className="h-12 rounded-lg bg-brand-600 px-6 text-[15px] font-semibold shadow-[0_8px_20px_-8px_rgba(34,116,84,0.5)] transition hover:bg-brand-700"
              >
                <CalendarPlus className="mr-2 size-[18px]" aria-hidden />
                Request appointment
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => setView("find")}
                className="h-12 rounded-lg px-5 text-[15px] font-semibold text-brand-700 transition-colors hover:bg-brand-50"
              >
                Explore services
                <ArrowRight className="ml-2 size-4" aria-hidden />
              </Button>
            </motion.div>

            {/* Stats — one editorial strip, thin dividers */}
            <motion.dl
              variants={item}
              className="mt-12 flex max-w-lg items-stretch divide-x divide-brand-200/80"
              aria-label="Platform summary"
            >
              {[
                { n: PROVIDERS.length, label: "Participating providers" },
                { n: DOCTORS.length, label: "Doctor profiles" },
                { n: PACKAGES.length, label: "Checkup packages" },
              ].map((s, i) => (
                <div key={s.label} className={i === 0 ? "pr-6" : "px-6"}>
                  <dd className="text-3xl font-semibold tracking-[-0.02em] text-ink">
                    <Counter to={s.n} />
                  </dd>
                  <dt className="mt-1 text-[12px] leading-snug text-muted-foreground">
                    {s.label}
                  </dt>
                </div>
              ))}
            </motion.dl>
          </motion.div>

          {/* ECG + scroll cue */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
            <EcgLine className="h-12 w-full opacity-50" />
          </div>
          <motion.button
            onClick={() => setView("find")}
            className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-500 lg:flex"
            animate={{ y: [0, 7, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            aria-label="Scroll to services"
          >
            Scroll
            <ChevronDown className="size-3.5" aria-hidden />
          </motion.button>
        </div>
      </section>

      {/* ========================= EMERGENCY BAND ========================= */}
      <section className="px-4 sm:px-6" aria-label="Emergency guidance">
        <Reveal className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-2xl border border-[#e8dfe0] border-l-4 border-l-rose-600 bg-white p-5 shadow-[0_1px_2px_rgba(10,38,27,0.04),0_10px_28px_-16px_rgba(10,38,27,0.14)] sm:p-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                <Siren className="size-5" aria-hidden />
              </span>
              <div className="flex-1">
                <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                  In an emergency, don&apos;t wait — call now
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                  {EMERGENCY.notice} Online ambulance booking stays disabled until a verified
                  dispatch partner is integrated (FR-14 / AC-11).
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${EMERGENCY.ambulance}`}
                  className="flex h-11 items-center gap-2 rounded-lg bg-rose-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
                >
                  <PhoneCall className="size-4" aria-hidden />
                  108
                </a>
                <a
                  href={`tel:${EMERGENCY.national}`}
                  className="flex h-11 items-center gap-2 rounded-lg border border-[#e8dfe0] bg-white px-5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50"
                >
                  <PhoneCall className="size-4" aria-hidden />
                  112
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ========================= LAVASA PLACE BAND ======================== */}
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6" aria-label="About Lavasa">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionHead
              eyebrow="Rooted in Lavasa"
              title={
                <>
                  Care that understands{" "}
                  <span className="text-brand-600">the hill city</span>
                </>
              }
              sub="Lavasa stretches across a Sahyadri valley — the lakeside promenade, Dasve, Mugaon and the roads that weave between them. LavasaCare maps participating providers onto that same geography, so finding help never depends on knowing the town."
            />
            <ul className="mt-8 space-y-3.5">
              {LAVASA_POINTS.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                >
                  <span
                    className="mt-[7px] size-1.5 shrink-0 rounded-full bg-brand-400"
                    aria-hidden="true"
                  />
                  {t}
                </li>
              ))}
            </ul>
            <Reveal delay={0.15}>
              <button
                onClick={() => setView("coverage")}
                className="group mt-8 inline-flex items-center gap-2 text-[14px] font-semibold text-brand-700 transition-colors hover:text-brand-600"
              >
                Check coverage in your area
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </button>
            </Reveal>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative pb-14 pl-0 sm:pl-8 lg:pb-10">
              <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-border shadow-[0_24px_48px_-24px_rgba(10,38,27,0.35)]">
                <Image
                  src="/images/lavasa-lake.jpg"
                  alt="Lavasa lakefront with the Sahyadri hills behind"
                  fill
                  sizes="(min-width: 1024px) 44vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-1 left-0 hidden w-52 overflow-hidden rounded-xl border border-border bg-cream p-1.5 shadow-[0_16px_32px_-16px_rgba(10,38,27,0.4)] sm:block lg:w-60">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src="/images/lavasa-promenade.jpg"
                    alt="The Lavasa lakeside promenade at dusk"
                    fill
                    sizes="240px"
                    className="object-cover"
                  />
                </div>
                <p className="py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  The promenade · Dasve
                </p>
              </div>
              <div className="absolute -top-4 right-4 flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-2 shadow-[0_8px_20px_-10px_rgba(10,38,27,0.3)] sm:-right-2">
                <MapPinned className="size-3.5 text-brand-600" aria-hidden />
                <span className="text-[11px] font-semibold text-ink">
                  Lavasa · Pune district
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================== SERVICES BENTO ========================= */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6" aria-label="Main services">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHead
            eyebrow="Main services"
            title={
              <>
                Everything a neighbourhood needs,{" "}
                <span className="text-brand-600">one place</span>
              </>
            }
          />
          <Reveal delay={0.1}>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground md:pb-1 md:text-right">
              Each service follows the SRS honestly: requests are routed to participating
              providers, and nothing is presented as confirmed until the provider confirms it.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-6">
          {SERVICES.map((s, i) => (
            <Reveal key={s.key} delay={i * 0.06} className={s.span}>
              <button
                onClick={() => setView(s.key)}
                className="group flex h-full w-full flex-col rounded-2xl border border-border bg-white p-6 text-left card-hover sm:flex-row sm:items-stretch sm:gap-6"
              >
                <span className="flex flex-1 flex-col">
                  <span className="flex size-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                    <s.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.01em] text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600">
                    Open
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </span>
                {s.img ? (
                  <span className="relative mt-5 hidden w-[132px] shrink-0 overflow-hidden rounded-xl ring-1 ring-border sm:mt-0 sm:block">
                    <Image
                      src={s.img}
                      alt={s.imgAlt ?? ""}
                      fill
                      sizes="132px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                  </span>
                ) : null}
              </button>
            </Reveal>
          ))}

          {/* Coverage tile — deep forest anchor */}
          <Reveal delay={0.3} className="md:col-span-3">
            <button
              onClick={() => setView("coverage")}
              className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-brand-950 p-6 text-left card-hover"
            >
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background:
                    "radial-gradient(28rem 16rem at 85% -10%, rgba(92,171,138,0.32), transparent 60%)",
                }}
                aria-hidden="true"
              />
              <div className="relative flex flex-1 flex-col">
                <span className="flex size-11 items-center justify-center rounded-lg bg-white/10 text-brand-200 ring-1 ring-white/15">
                  <MapPinned className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.01em] text-white">
                  Service coverage
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/65">
                  Check verified coverage by area or PIN code. We never promise coverage that
                  hasn&apos;t been confirmed by the provider (FR-12).
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-200">
                  Check your area
                  <ArrowRight
                    className="size-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </div>
            </button>
          </Reveal>
          <Reveal delay={0.36} className="md:col-span-3">
            <button
              onClick={() => setView("admin")}
              className="group flex h-full w-full flex-col rounded-2xl border border-border bg-cream p-6 text-left card-hover"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-white text-brand-600 ring-1 ring-brand-100">
                <Search className="size-5" aria-hidden />
              </span>
              <h3 className="mt-5 flex items-center gap-2 text-[17px] font-semibold tracking-[-0.01em] text-ink">
                Provider admin
                <DemoChip label="Demo" />
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                Authorised staff can review requests, update statuses and maintain service
                information — with actor + time recorded for every change (FR-16 → FR-18).
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600">
                Open demo dashboard
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </button>
          </Reveal>
        </div>
      </section>

      {/* ============================= MARQUEE ============================ */}
      <section aria-label="Specialties" className="border-y border-border bg-white/70 py-4">
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="flex w-max animate-marquee gap-10 pr-10">
            {[...SPECIALTIES, ...SPECIALTIES].map((s, i) => (
              <span
                key={`${s}-${i}`}
                className="flex items-center gap-3 whitespace-nowrap text-[13px] font-medium uppercase tracking-[0.2em] text-brand-700/60"
              >
                <span className="size-1 rounded-full bg-brand-300" aria-hidden />
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ HOW IT WORKS ========================= */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6" aria-label="How it works">
        <SectionHead
          eyebrow="How it works"
          title="Three calm steps"
          sub="No guesswork — the platform shows exactly where every request stands, and hands over to the provider for the final confirmation."
        />
        <div className="relative mt-14 grid gap-4 md:grid-cols-3">
          <div
            className="absolute left-[16%] right-[16%] top-6 hidden h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent md:block"
            aria-hidden="true"
          />
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="relative h-full rounded-2xl border border-border bg-white p-7 card-hover">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold tracking-[0.08em] text-brand-500">
                    {s.n}
                  </span>
                  <span className="h-px flex-1 bg-border" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.01em] text-ink">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================== TRUST ============================== */}
      <section
        className="border-y border-border bg-white py-24"
        aria-label="Trust and safety"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead
            center
            eyebrow="Built on SRS principles"
            title="Designed to be trusted"
            sub="The specification asks for honesty, accessibility and privacy — these are that promise, made visible."
          />
          <div className="mt-14 grid items-stretch gap-4 lg:grid-cols-5">
          {/* feature photo — care you can picture */}
          <Reveal className="lg:col-span-2">
            <div className="relative h-full min-h-[320px] overflow-hidden rounded-2xl border border-border">
              <Image
                src="/images/caregiver.jpg"
                alt="A caregiver warmly checking on an elderly resident"
                fill
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="object-cover"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink/60 to-transparent"
                aria-hidden="true"
              />
              <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/20 bg-white p-4 shadow-[0_16px_32px_-16px_rgba(10,38,27,0.5)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-600">
                  Live request status
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold tracking-[-0.01em] text-ink">
                  <BadgeCheck className="size-4 text-brand-600" aria-hidden />
                  Confirmed · REF-2026-0187
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  Confirmed by the provider · 09:42, with a full audit trail
                </p>
              </div>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3">
            {TRUST.map((t, i) => (
              <Reveal key={t.title} delay={i * 0.07}>
                <div className="h-full rounded-2xl border border-border bg-background p-6 card-hover">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-white text-brand-600 ring-1 ring-border">
                    <t.icon className="size-[18px]" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.01em] text-ink">
                    {t.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {t.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* ============================== CTA =============================== */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6" aria-label="Get started">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-brand-950 px-6 py-20 text-center text-white sm:px-12">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(42rem 22rem at 50% -20%, rgba(92,171,138,0.26), transparent 62%), radial-gradient(30rem 18rem at 88% 110%, rgba(34,116,84,0.35), transparent 60%)",
              }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "26px 26px",
                maskImage: "radial-gradient(70% 70% at 50% 40%, black, transparent)",
                WebkitMaskImage: "radial-gradient(70% 70% at 50% 40%, black, transparent)",
              }}
              aria-hidden="true"
            />
            <div className="relative">
              <p className="eyebrow eyebrow-center justify-center text-brand-300">Get started</p>
              <h2 className="mx-auto mt-5 max-w-2xl text-balance text-3xl font-bold leading-[1.14] tracking-[-0.022em] sm:text-[2.6rem]">
                Ready when you are — care, clearly labelled and close to home.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-white/70">
                Start with a search, a request, or just browse the directory. Every step explains
                itself, and every status means what it says.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Button
                  size="lg"
                  onClick={() => goSearch("")}
                  className="h-12 rounded-lg bg-white px-7 text-[15px] font-semibold text-brand-900 shadow-none transition-colors hover:bg-brand-50"
                >
                  <Search className="mr-2 size-[18px]" aria-hidden />
                  Find care now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setView("medicine")}
                  className="h-12 rounded-lg border-white/25 bg-transparent px-7 text-[15px] font-semibold text-white transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Pill className="mr-2 size-[18px]" aria-hidden />
                  Request medicine
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
