"use client";

import { motion } from "motion/react";
import type { ProjectListItem } from "@/sanity/queries";
import { ProjectCard } from "./ProjectCard";

// ─── Layout helpers ───────────────────────────────────────────────────────────
function toColumns<T>(items: T[], n: number): T[][] {
  return Array.from({ length: n }, (_, col) =>
    items.filter((_, i) => i % n === col),
  );
}

// ─── Variants ─────────────────────────────────────────────────────────────────
//  Each card uses a `custom` index corresponding to reading order
//  (left-to-right, top-to-bottom).  For n columns, the card at
//  (colIdx, rowIdx) has globalIdx = colIdx + rowIdx * n.
//
//  The provider's 0.22s enter fade completes first (delayChildren: 0.22),
//  then cards stagger in so there is no opacity compounding.

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.48,
      delay,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
  // Outro : toutes les cards sortent ensemble, rapide, légèrement vers le haut.
  // Déclenché automatiquement par AnimatePresence quand la page est démontée.
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.18,
      ease: [0.4, 0, 1, 0.6] as [number, number, number, number],
    },
  },
};

const STAGGER = 0.055; // seconds between successive cards
const LEAD    = 0.18;  // seconds — démarre légèrement avant la fin du fade-in (0.22 s)

function delay(colIdx: number, rowIdx: number, cols: number) {
  return LEAD + (colIdx + rowIdx * cols) * STAGGER;
}

// ─── WorkGrid ─────────────────────────────────────────────────────────────────
export function WorkGrid({ projects }: { projects: ProjectListItem[] }) {
  return (
    <main className="p-4">
      {/* Mobile — 1 col */}
      <div className="flex flex-col gap-4 md:hidden">
        {projects.map((p, i) => (
          <motion.div
            key={p._id}
            variants={cardVariants}
            custom={LEAD + i * STAGGER}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ProjectCard project={p} />
          </motion.div>
        ))}
      </div>

      {/* Tablet — 2 cols */}
      <div className="hidden gap-4 md:flex lg:hidden">
        {toColumns(projects, 2).map((col, colIdx) => (
          <div key={colIdx} className="flex flex-1 flex-col gap-4">
            {col.map((p, rowIdx) => (
              <motion.div
                key={p._id}
                variants={cardVariants}
                custom={delay(colIdx, rowIdx, 2)}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <ProjectCard project={p} />
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      {/* Desktop — 3 cols */}
      <div className="hidden gap-4 lg:flex">
        {toColumns(projects, 3).map((col, colIdx) => (
          <div key={colIdx} className="flex flex-1 flex-col gap-4">
            {col.map((p, rowIdx) => (
              <motion.div
                key={p._id}
                variants={cardVariants}
                custom={delay(colIdx, rowIdx, 3)}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <ProjectCard project={p} />
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
