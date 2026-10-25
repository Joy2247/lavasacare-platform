"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * IntroLoader — a short branded opening:
 * a doctor physically pushes the progress bar from 0 → 100.
 * Dismisses itself once the page is ready (min ~2.4s so it always
 * reads as a deliberate moment).
 */

/* --------------------------- doctor pushing the bar --------------------------- */

function DoctorPushing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 118 96" className={className} aria-hidden="true">
      {/* trailing coat hem */}
      <path
        d="M52 34 C40 44 34 58 30 66 L44 70 C48 60 52 52 58 46 Z"
        fill="#ffffff"
        stroke="#cfe0d6"
        strokeWidth="1.5"
      />
      {/* back leg (extended) */}
      <path
        d="M58 56 L44 72 L34 85"
        fill="none"
        stroke="#2e4a3c"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* front leg (planted, bent) */}
      <path
        d="M58 56 L68 70 L65 85"
        fill="none"
        stroke="#3a5a49"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* shoes */}
      <path d="M33 85 h12 a3 3 0 0 1 3 3 v1 h-17 a2.5 2.5 0 0 1 2.5 -2.5 Z" fill="#f2f5f3" stroke="#cfe0d6" strokeWidth="1.2" />
      <path d="M64 85 h12 a3 3 0 0 1 3 3 v1 h-17 a2.5 2.5 0 0 1 2.5 -2.5 Z" fill="#ffffff" stroke="#cfe0d6" strokeWidth="1.2" transform="translate(-1 0)" />
      {/* coat body — leaning forward */}
      <path
        d="M55 30 C52 40 51 50 53 60 L70 60 C71 50 70 38 66 30 Z"
        fill="#ffffff"
        stroke="#cfe0d6"
        strokeWidth="1.5"
      />
      {/* rear arm (lower) */}
      <path
        d="M58 34 L78 40 L96 44"
        fill="none"
        stroke="#e8efe9"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* front arm */}
      <path
        d="M60 32 L80 36 L98 38"
        fill="none"
        stroke="#ffffff"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* hands at the bar tip */}
      <circle cx="100" cy="38" r="3.4" fill="#e7b48b" />
      <circle cx="98.5" cy="44.5" r="3.1" fill="#d9a276" />
      {/* stethoscope */}
      <path
        d="M60 31 C60 40 62 46 66 50"
        fill="none"
        stroke="#227454"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="67" cy="52" r="2.6" fill="#227454" />
      {/* head */}
      <circle cx="64" cy="17" r="8.6" fill="#e7b48b" />
      {/* hair + ear */}
      <path
        d="M55.5 15 C55.5 8.5 61 6.5 65 7 C70.5 7.6 73 11.5 72.6 16 C70 13.8 66.5 12.6 62.5 13.2 C59.8 13.6 57.4 14.4 55.5 15 Z"
        fill="#33281e"
      />
      <circle cx="60.5" cy="18.5" r="1.4" fill="#d9a276" />
      {/* nose hint */}
      <path d="M72.6 17.5 L74.6 18.8 L72.4 20" fill="none" stroke="#d9a276" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* --------------------------------- messages --------------------------------- */

const MESSAGES = [
  "Waking the care instrument…",
  "Mapping participating providers…",
  "Checking hillside coverage…",
  "Calibrating honest statuses…",
  "Opening the doors…",
];

const MIN_MS = 2400;

export function IntroLoader() {
  const [progress, setProgress] = useState(6);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - t0;
      const ready = document.readyState === "complete";
      const cap = ready && elapsed >= MIN_MS ? 100 : Math.min(93, 6 + (elapsed / MIN_MS) * 87);
      setProgress((p) => Math.max(p, cap));
      if (cap >= 100 && !doneRef.current) {
        doneRef.current = true;
        setDone(true);
        window.setTimeout(() => {
          document.body.style.overflow = "";
          setGone(true);
        }, 620);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, []);

  const msg = MESSAGES[Math.min(MESSAGES.length - 1, Math.floor((progress / 100) * MESSAGES.length))];

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          key="intro-loader"
          role="status"
          aria-label="LavasaCare is loading"
          className="fixed inset-0 z-[9990] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -28, filter: "blur(6px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* faint ambience */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(34rem 22rem at 50% 34%, rgba(92,171,138,0.16), transparent 62%), radial-gradient(26rem 18rem at 50% 110%, rgba(189,224,205,0.3), transparent 60%)",
            }}
          />

          <div className="relative flex flex-col items-center px-6">
            {/* wordmark */}
            <p className="mt-2 text-[24px] font-bold tracking-[-0.02em] text-ink">
              Lavasa<span className="text-brand-600">Care</span>
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-700/70">
              Lavasa · Maharashtra
            </p>

            {/* progress + pushing doctor */}
            <div className="relative mt-14 h-16 w-[248px] sm:w-[320px]">
              <div className="absolute inset-x-0 bottom-4 h-2 overflow-hidden rounded-full bg-brand-100/80 ring-1 ring-brand-100">
                <div
                  className="relative h-full rounded-full bg-brand-600"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {/* doctor riding the leading edge */}
              <div
                className="absolute bottom-[7px]"
                style={{ left: `${progress}%`, width: 0 }}
                aria-hidden="true"
              >
                <div className="animate-doc-bob">
                  <DoctorPushing className="h-[70px] w-auto -translate-x-[94%] translate-y-[1px]" />
                </div>
              </div>
            </div>

            {/* % + status */}
            <div className="mt-1 flex w-[248px] items-baseline justify-between sm:w-[320px]">
              <motion.p
                key={msg}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-[12px] font-medium text-muted-foreground"
              >
                {msg}
              </motion.p>
              <p className="text-[12px] font-bold tabular-nums tracking-[0.06em] text-brand-700">
                {Math.round(progress)}%
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
