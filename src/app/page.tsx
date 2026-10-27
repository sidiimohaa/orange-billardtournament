"use client";

import { useState, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { ArrowUpRight, Globe2, MapPin, Trophy, Users, CalendarDays, Check } from "lucide-react";
import Ball3D from "@/components/Ball3D";
import Preloader from "@/components/Preloader";
import Countdown from "@/components/Countdown";
import ThemeToggle from "@/components/ThemeToggle";

const EASE = [0.76, 0, 0.24, 1] as const;

function Reveal({ children, delay = 0, show = true }: { children: ReactNode; delay?: number; show?: boolean }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={show ? { y: 0 } : undefined}
        transition={{ duration: 1.1, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function InView({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const row = [...items, ...items];
  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <motion.div
        className="flex shrink-0 gap-10 pr-10"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-5xl uppercase md:text-7xl">
            {t}
            <span className="inline-block size-4 rounded-full bg-orange md:size-6" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

const FACTS = [
  { icon: Users, n: "64", label: "Joueurs", text: "Le top mondial du 9-ball, sur invitation et qualifications." },
  { icon: Globe2, n: "28", label: "Nations", text: "Europe, Asie, Amériques : la planète billard débarque en Provence." },
  { icon: Trophy, n: "250K€", label: "Dotation", text: "Cinq jours, une seule table TV, un seul champion." },
];

export default function Home() {
  const [ready, setReady] = useState(false);
  const [sent, setSent] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroShift = useTransform(scrollYProgress, [0, 0.25], ["0%", "-30%"]);

  return (
    <>
      <Preloader onDone={() => setReady(true)} />
      <Ball3D ready={ready} />
      <div className="grain" />

      {/* Scroll progress */}
      <motion.div className="fixed left-0 top-0 z-50 h-1 origin-left bg-ink" style={{ scaleX: scrollYProgress, width: "100%" }} />

      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 py-4 md:px-8 md:py-6">
        <span className="font-display text-xl uppercase tracking-wide">Orange Open</span>
        <div className="flex items-center gap-2">
        <ThemeToggle />
        <a
          href="#tickets"
          className="group flex items-center gap-1 rounded-full border border-ink bg-orange px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition hover:bg-ink hover:text-orange"
        >
          Billetterie <ArrowUpRight className="size-3.5 transition group-hover:rotate-45" />
        </a>
        </div>
      </header>

      <main className="relative z-10">
        {/* HERO */}
        <section className="relative flex min-h-svh flex-col justify-end overflow-hidden px-4 pb-8 pt-28 md:px-8">
          <motion.div style={{ y: heroShift }}>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] md:text-xs">
              <Reveal show={ready} delay={0.1}>International 9-Ball Championship — Dans deux mois</Reveal>
            </p>
            <h1 className="font-display uppercase leading-[0.82] tracking-tight">
              <span className="block text-[26vw] md:text-[19vw]"><Reveal show={ready} delay={0.2}>Orange</Reveal></span>
              <span className="block text-[17vw] md:text-[11vw]">
                <Reveal show={ready} delay={0.32}><span className="outline-text">Open</span> 2026</Reveal>
              </span>
            </h1>
          </motion.div>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-t-2 border-ink pt-5">
            <div className="flex gap-8 font-mono text-[11px] uppercase tracking-[0.2em] md:text-xs">
              <span className="flex items-center gap-2"><CalendarDays className="size-4" /> 27 — 31 déc. 2026</span>
              <span className="flex items-center gap-2"><MapPin className="size-4" /> Orange, Vaucluse</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em]">
              Scroll
              <DotLottieReact src="/lottie/scroll.json" loop autoplay className="h-10 w-7 dark:invert dark:sepia dark:saturate-[6] dark:hue-rotate-[-20deg]" />
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <section className="-rotate-2 scale-105 bg-ink py-6 text-cream">
          <Marquee items={["Les meilleurs joueurs de la planète", "Billard américain", "Orange · Vaucluse", "Décembre 2026"]} />
        </section>

        {/* COUNTDOWN */}
        <section className="px-4 py-32 md:px-8 md:py-48">
          <div className="mb-12 grid gap-6 md:grid-cols-12">
            <h2 className="font-display text-6xl uppercase leading-[0.9] md:col-span-7 md:text-8xl">
              <InView>La casse</InView>
              <InView delay={0.08}>est imminente</InView>
            </h2>
            <p className="max-w-sm self-end text-lg leading-snug md:col-span-4 md:col-start-9">
              Le compte à rebours est lancé. Premier break le 27 décembre à 18h, heure de Provence.
            </p>
          </div>
          <Countdown />
        </section>

        {/* CITY */}
        <section className="relative bg-ink px-4 py-32 text-orange md:px-8 md:py-48">
          <div className="grid gap-12 md:grid-cols-12">
            <p className="font-mono text-xs uppercase tracking-[0.25em] md:col-span-3">(01) — La ville</p>
            <div className="md:col-span-8 md:col-start-5">
              <h2 className="font-display text-6xl uppercase leading-[0.9] md:text-[8vw]">
                <InView>Deux mille ans</InView>
                <InView delay={0.08}><span className="text-cream">d’arène.</span></InView>
                <InView delay={0.16}>Une table.</InView>
              </h2>
              <p className="mt-10 max-w-xl text-lg leading-relaxed text-cream/80 md:text-xl">
                Orange, cité des Princes et de son Théâtre antique classé à l’UNESCO, accueille pour la
                première fois l’élite mondiale du billard américain. Cinq jours de matchs couperet, de
                bricoles impossibles et de casses à 40 km/h, au cœur du Vaucluse.
              </p>
            </div>
          </div>
        </section>

        {/* FACTS */}
        <section className="px-4 py-32 md:px-8 md:py-40">
          <p className="mb-10 font-mono text-xs uppercase tracking-[0.25em]">(02) — Le tournoi</p>
          <div className="grid gap-4 md:grid-cols-3">
            {FACTS.map(({ icon: Icon, n, label, text }, i) => (
              <motion.article
                key={label}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.9, ease: EASE, delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="group flex min-h-80 flex-col justify-between rounded-3xl border-2 border-ink bg-orange p-6 transition-colors hover:bg-ink hover:text-orange"
              >
                <div className="flex items-center justify-between">
                  <Icon className="size-7" strokeWidth={1.5} />
                  <span className="font-mono text-xs uppercase tracking-[0.2em]">{label}</span>
                </div>
                <div>
                  <div className="font-display text-8xl leading-none">{n}</div>
                  <p className="mt-4 max-w-[28ch] leading-snug">{text}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="border-y-2 border-ink py-5">
          <Marquee reverse items={["Break", "Run out", "Safety", "Push out", "Golden break"]} />
        </section>

        {/* CTA */}
        <section id="tickets" className="flex min-h-svh flex-col justify-between px-4 pb-8 pt-32 md:px-8">
          <div className="text-center">
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.25em]">(03) — Billetterie</p>
            <h2 className="font-display text-[18vw] uppercase leading-[0.82] md:text-[13vw]">
              <InView>Prenez</InView>
              <InView delay={0.08}><span className="outline-text">la queue</span></InView>
            </h2>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="relative z-30 mx-auto mt-[38vh] flex w-full max-w-xl items-center gap-2 rounded-full border-2 border-ink bg-orange p-1.5 md:mt-[30vh]"
          >
            <input
              type="email" required placeholder="votre@email.com" disabled={sent}
              className="min-w-0 flex-1 bg-transparent px-4 font-mono text-sm placeholder:text-ink/50 focus:outline-none"
            />
            <button className="flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-orange transition hover:bg-cream hover:text-ink">
              {sent ? <>Inscrit <Check className="size-4" /></> : <>Prévente <ArrowUpRight className="size-4" /></>}
            </button>
          </form>

          <footer className="mt-16 flex flex-wrap justify-between gap-4 border-t-2 border-ink pt-5 font-mono text-[11px] uppercase tracking-[0.2em]">
            <span>© Orange Open 2026</span>
            <span>Orange · Vaucluse · France</span>
            <span>27.12 — 31.12</span>
          </footer>
        </section>
      </main>
    </>
  );
}
