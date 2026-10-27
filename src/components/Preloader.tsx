"use client";

import { useEffect, useState } from "react";
import { animate, motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";

// 15-ball rack (triangle), orange 5-ball at the apex of the break
const R = 14;
const RACK = Array.from({ length: 5 }, (_, row) =>
  Array.from({ length: row + 1 }, (_, i) => ({
    x: row * R * 1.75,
    y: (i - row / 2) * R * 2.05,
  })),
).flat();
const COLORS = ["#ff5a1f", "#120a06", "#fff3e8", "#ff8a3d", "#e5410a"];

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"rack" | "break" | "out">("rack");
  const progress = useMotionValue(0);
  const label = useTransform(progress, (v) => String(Math.round(v)).padStart(3, "0"));
  const bar = useTransform(progress, (v) => `${v}%`);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    const ctrl = animate(progress, 100, {
      duration: 2.4,
      ease: [0.65, 0, 0.35, 1],
      onComplete: () => {
        setPhase("break");
        setTimeout(() => setPhase("out"), 1100);
      },
    });
    return () => ctrl.stop();
  }, [progress]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.documentElement.style.overflow = "";
        onDone();
      }}
    >
      {phase !== "out" && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[70] flex flex-col bg-ink text-orange"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex justify-between p-5 font-mono text-[11px] uppercase tracking-[0.2em] md:p-8">
            <span>Orange Open ’26</span>
            <span>Racking up</span>
          </div>

          <div className="relative flex flex-1 items-center justify-center">
            <svg viewBox="-260 -90 420 180" className="w-[min(92vw,640px)] overflow-visible">
              {/* table line */}
              <motion.line
                x1="-260" x2="160" y1="80" y2="80" stroke="#ff5a1f" strokeOpacity=".25"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }}
              />
              {/* cue */}
              <motion.g
                initial={{ x: -120, opacity: 0 }}
                animate={
                  phase === "rack"
                    ? { x: [-120, -150, -150], opacity: 1 }
                    : { x: -40, opacity: 0 }
                }
                transition={
                  phase === "rack"
                    ? { duration: 2.2, times: [0, 0.6, 1], ease: "easeInOut" }
                    : { duration: 0.18, ease: "easeIn" }
                }
              >
                <rect x="-260" y="-3" width="190" height="6" rx="3" fill="#fff3e8" />
                <rect x="-76" y="-3" width="10" height="6" rx="2" fill="#ff5a1f" />
              </motion.g>
              {/* cue ball */}
              <motion.circle
                r={R} cy={0} fill="#fff3e8"
                initial={{ cx: -40, scale: 0 }}
                animate={phase === "rack" ? { cx: -40, scale: 1 } : { cx: -2, scale: 1 }}
                transition={phase === "rack" ? { delay: 0.3, type: "spring" } : { duration: 0.2, delay: 0.12 }}
              />
              {/* rack */}
              {RACK.map((b, i) => {
                const angle = Math.atan2(b.y, b.x + 30) + (i % 2 ? 0.4 : -0.4);
                const dist = 220 + (i * 37) % 160;
                return (
                  <motion.circle
                    key={i}
                    r={R - 1}
                    fill={COLORS[i % COLORS.length]}
                    stroke="#ff5a1f"
                    strokeWidth={1.5}
                    initial={{ cx: 20 + b.x, cy: b.y, scale: 0 }}
                    animate={
                      phase === "rack"
                        ? { cx: 20 + b.x, cy: b.y, scale: 1 }
                        : { cx: 20 + b.x + Math.cos(angle) * dist, cy: b.y + Math.sin(angle) * dist * 0.6, scale: 1 }
                    }
                    transition={
                      phase === "rack"
                        ? { delay: 0.1 + i * 0.07, type: "spring", stiffness: 300, damping: 18 }
                        : { delay: 0.3, duration: 0.9, ease: [0.1, 0.9, 0.2, 1] }
                    }
                  />
                );
              })}
            </svg>
          </div>

          <div className="flex items-end justify-between p-5 md:p-8">
            <p className="max-w-[18ch] font-mono text-[11px] uppercase leading-relaxed tracking-[0.2em] opacity-60">
              International 9-Ball Championship — Orange, Vaucluse
            </p>
            <motion.span className="font-display text-[22vw] leading-[0.8] md:text-[14vw]">{label}</motion.span>
          </div>
          <motion.div className="h-1 bg-orange" style={{ width: bar }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
