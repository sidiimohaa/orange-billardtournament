"use client";

import { useEffect, useState } from "react";

export const EVENT_DATE = new Date("2026-12-27T18:00:00+01:00");

function diff() {
  const ms = Math.max(0, EVENT_DATE.getTime() - Date.now());
  return {
    jours: Math.floor(ms / 864e5),
    heures: Math.floor(ms / 36e5) % 24,
    min: Math.floor(ms / 6e4) % 60,
    sec: Math.floor(ms / 1e3) % 60,
  };
}

export default function Countdown() {
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);
  useEffect(() => {
    setT(diff());
    const id = setInterval(() => setT(diff()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-6">
      {(["jours", "heures", "min", "sec"] as const).map((k) => (
        <div key={k} className="border-t-2 border-ink pt-3">
          <div className="font-display text-[15vw] leading-none tabular-nums md:text-[9vw]">
            {t ? String(t[k]).padStart(2, "0") : "--"}
          </div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] md:text-xs">{k}</div>
        </div>
      ))}
    </div>
  );
}
