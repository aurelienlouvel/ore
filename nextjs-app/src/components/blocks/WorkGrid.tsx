"use client";

import { useState, useEffect } from "react";
import { motion, type Variants } from "motion/react";
import type { ProjectListItem } from "@/sanity/queries";
import { ProjectCard } from "./ProjectCard";
import { EASE_BOUNCE, EASE_IN } from "@/lib/easings";

// ─── Layout helpers ───────────────────────────────────────────────────────────
function toColumns<T>(items: T[], n: number): T[][] {
  return Array.from({ length: n }, (_, col) =>
    items.filter((_, i) => i % n === col),
  );
}

// ─── Variants ─────────────────────────────────────────────────────────────────
//  custom = position de la card dans l'ordre de lecture (i) + total (n).
//  Stagger ET distance exponentiels (puissance) : les cards « proches » (i petit)
//  partent vite et de peu, les « lointaines » (i grand) plus tard et de bien plus
//  loin → vague ample mais dynamique. Intro = spring bouncy ; outro = chute vers
//  le bas qui accélère (ease-in), même logique de vague.
type CardCustom = { i: number; n: number };
const norm = ({ i, n }: CardCustom) => (n > 1 ? i / (n - 1) : 0);

const LEAD = 0.02; // délai avant le départ de la 1ère card
const STEP_IN = 0.028; // pas LINÉAIRE garanti entre cards → vague vive
const STEP_OUT = 0.03;
const IN_EXP = 0.15; // boost EXPONENTIEL du délai d'entrée (cards lointaines + tard)
const OUT_EXP = 0.15;
const P_DELAY = 2; // exposant du boost exponentiel
const P_DIST = 1.7; // exposant de la distance
const Y_IN_MIN = 40,
  Y_IN_MAX = 240; // distance d'entrée (depuis le bas)
const Y_OUT_MIN = 48,
  Y_OUT_MAX = 300; // distance de sortie (vers le bas)
const MAX_ROT = 5; // ° — légère inclinaison initiale par card (rendu organique)

// Angle pseudo-aléatoire déterministe selon la position (stable entre rendus).
const rotFor = (i: number, salt = 0) => Math.sin((i + salt) * 99.13) * MAX_ROT;

// Délai = pas linéaire (visibilité de la vague) + boost exponentiel (les cards
// lointaines partent encore plus tard). Distance = puissance de la position.
const delayIn = (c: CardCustom) =>
  LEAD + c.i * STEP_IN + IN_EXP * norm(c) ** P_DELAY;
const delayOut = (c: CardCustom) =>
  c.i * STEP_OUT + OUT_EXP * norm(c) ** P_DELAY;

const cardVariants: Variants = {
  hidden: (c: CardCustom) => ({
    opacity: 0,
    y: Y_IN_MIN + (Y_IN_MAX - Y_IN_MIN) * norm(c) ** P_DIST,
    rotate: rotFor(c.i),
  }),
  visible: (c: CardCustom) => ({
    opacity: 1,
    y: 0,
    rotate: 0, // se redresse
    // back.out plus marqué — la card monte vite, rebondit légèrement, se cale.
    transition: {
      duration: 0.45,
      delay: delayIn(c),
      ease: EASE_BOUNCE,
    },
  }),
  // Outro : vague qui descend vers le bas (y positif), stagger + distance
  // croissants, accélération en tombant, avec une légère bascule.
  exit: (c: CardCustom) => ({
    opacity: 0,
    y: Y_OUT_MIN + (Y_OUT_MAX - Y_OUT_MIN) * norm(c) ** P_DIST,
    rotate: rotFor(c.i, 7),
    transition: {
      duration: 0.4,
      delay: delayOut(c),
      ease: EASE_IN,
    },
  }),
};

// ─── WorkGrid ─────────────────────────────────────────────────────────────────
export function WorkGrid({ projects }: { projects: ProjectListItem[] }) {
  // `shown` pilote l'intro via un changement d'`animate` (et non l'`initial`),
  // donc elle joue à chaque montage — premier chargement du site inclus.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const animate = shown ? "visible" : "hidden";
  const n = projects.length;

  // Une card avec son index global (ordre de lecture gauche→droite, haut→bas).
  const card = (p: ProjectListItem, globalIdx: number) => (
    <motion.div
      key={p._id}
      variants={cardVariants}
      custom={{ i: globalIdx, n }}
      initial="hidden"
      animate={animate}
      exit="exit"
    >
      <ProjectCard project={p} />
    </motion.div>
  );

  return (
    <main className="p-4 bg-white">
      {/* Mobile — 1 col */}
      <div className="flex flex-col gap-4 md:hidden">
        {projects.map((p, i) => card(p, i))}
      </div>

      {/* Tablet — 2 cols */}
      <div className="hidden gap-4 md:flex lg:hidden">
        {toColumns(projects, 2).map((col, colIdx) => (
          <div key={colIdx} className="flex flex-1 flex-col gap-4">
            {col.map((p, rowIdx) => card(p, colIdx + rowIdx * 2))}
          </div>
        ))}
      </div>

      {/* Desktop — 3 cols */}
      <div className="hidden gap-4 lg:flex">
        {toColumns(projects, 3).map((col, colIdx) => (
          <div key={colIdx} className="flex flex-1 flex-col gap-4">
            {col.map((p, rowIdx) => card(p, colIdx + rowIdx * 3))}
          </div>
        ))}
      </div>
    </main>
  );
}
