"use client";

import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Badge } from "@/components/ui/badge";
import { STATUS_STYLE, formatHoursAgo } from "@/lib/data";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------------------------- status --------------------------------- */

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_STYLE[status] || "bg-slate-100 text-slate-600 border-slate-200",
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

/* --------------------------------- demo chip ------------------------------- */

export function DemoChip({
  label = "Demo data",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border-slate-300/80 bg-white/80 text-[10px] font-semibold uppercase tracking-wider text-slate-500",
        className
      )}
      title="Demonstration data only — not real medical or operational information (FR-21)"
    >
      <FlaskConical className="size-3" aria-hidden />
      {label}
    </Badge>
  );
}

/* --------------------------------- reveal ---------------------------------- */

export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------ section header ------------------------------ */

export function SectionHead({
  eyebrow,
  title,
  sub,
  center,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  center?: boolean;
}) {
  return (
    <Reveal className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <div
        className={cn(
          "text-[12px] font-semibold uppercase tracking-[0.18em] text-brand-600",
          center ? "eyebrow eyebrow-center" : "eyebrow"
        )}
      >
        {eyebrow}
      </div>
      <h2 className="mt-4 text-balance text-3xl font-bold leading-[1.12] tracking-[-0.022em] text-ink sm:text-4xl">
        {title}
      </h2>
      {sub ? (
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{sub}</p>
      ) : null}
    </Reveal>
  );
}

/* -------------------------------- tilt card -------------------------------- */

export function TiltCard({
  children,
  className,
  max = 10,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [max, -max]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-max, max]), { stiffness: 180, damping: 18 });

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }
  return (
    <motion.div
      className={cn("will-change-transform [transform-style:preserve-3d]", className)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, perspective: 900 }}
    >
      {children}
    </motion.div>
  );
}

/* --------------------------------- counter --------------------------------- */

export function Counter({
  to,
  suffix = "",
  duration = 1.6,
  className,
}: {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {val.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* ------------------------------- freshness chip ---------------------------- */

export function Freshness({ hoursAgo }: { hoursAgo: number }) {
  const stale = hoursAgo > 6;
  const soon = hoursAgo > 3 && hoursAgo <= 6;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
        stale
          ? "border-rose-200 bg-rose-50 text-rose-600"
          : soon
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
      )}
      title={`Data age: ${formatHoursAgo(hoursAgo)}`}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          stale ? "bg-rose-500" : soon ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
        )}
      />
      {stale ? "Stale — call to confirm" : soon ? "Update due soon" : "Fresh"}
    </span>
  );
}

/* -------------------------------- empty state ------------------------------- */

export function EmptyState({
  title,
  sub,
  action,
  icon,
}: {
  title: string;
  sub: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-brand-200 bg-white/60 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
        {icon}
      </div>
      <p className="mt-4 text-lg font-bold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">{sub}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/* --------------------------------- ECG line --------------------------------- */

export function EcgLine({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 720 60"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M0 30 H90 l14-22 12 40 12-34 10 16 H280 l12-18 10 26 9-22 8 14 H470 l13-20 11 34 11-30 9 16 H720"
        stroke="url(#ecgGrad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="90 630"
        className="animate-ecg"
      />
      <defs>
        <linearGradient id="ecgGrad" x1="0" x2="720" gradientUnits="userSpaceOnUse">
          <stop stopColor="#90C9AD" />
          <stop offset="0.5" stopColor="#227454" />
          <stop offset="1" stopColor="#90C9AD" />
        </linearGradient>
      </defs>
    </svg>
  );
}
