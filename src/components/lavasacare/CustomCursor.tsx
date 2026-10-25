"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * iOS-inspired cursor companion.
 * A soft white dot glides after the pointer with a spring; over any
 * interactive element it blooms and "merges" into the control via
 * mix-blend-difference (the covered pixels invert, reading as one surface).
 * Touch-primary devices are excluded; honours prefers-reduced-motion.
 */

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, select, textarea, label, summary, [data-cursor]";

/** Matches touch-primary devices (no hover capability, coarse pointer only). */
const TOUCH_PRIMARY_QUERY = "(hover: none) and (pointer: coarse)";

const SIZE_SMALL = 14;
const SIZE_MERGED = 46;

function subscribeTouchPrimary(onChange: () => void) {
  const mq = window.matchMedia(TOUCH_PRIMARY_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function CustomCursor() {
  const reduce = useReducedMotion();
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  // Media-query state without setState-in-effect.
  const touchPrimary = useSyncExternalStore(
    subscribeTouchPrimary,
    () => window.matchMedia(TOUCH_PRIMARY_QUERY).matches,
    () => false,
  );
  const enabled = !touchPrimary && !reduce;

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const spring = { stiffness: 480, damping: 40, mass: 0.65 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const onOver = (e: PointerEvent) => {
      const el = e.target as Element | null;
      setHovering(!!el?.closest?.(INTERACTIVE_SELECTOR));
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const size = hovering ? SIZE_MERGED : SIZE_SMALL;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9998] mix-blend-difference"
      style={{ x: sx, y: sy }}
    >
      {/* fixed 46px stage keeps the blob centred without transform conflicts */}
      <div
        className="absolute grid place-items-center"
        style={{ left: -SIZE_MERGED / 2, top: -SIZE_MERGED / 2, width: SIZE_MERGED, height: SIZE_MERGED }}
      >
        <motion.div
          className="rounded-full bg-white"
          animate={{
            width: size,
            height: size,
            opacity: visible ? (hovering ? 0.9 : 0.95) : 0,
            scale: pressed ? 0.72 : 1,
          }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
        />
      </div>
    </motion.div>
  );
}
