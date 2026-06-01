"use client";

import { useContext, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
// Internal but stable shared-runtime context — used to freeze the outgoing
// route's content during its exit animation (see FrozenRouter below).
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * FrozenRouter — capture the router context at mount and never update it.
 *
 * En App Router, naviguer remplace immédiatement `children` par le contenu de
 * la nouvelle route. Sans gel, la page sortante (gardée montée par
 * AnimatePresence pendant son exit) se re-render avec le nouveau contexte →
 * l'animation d'outro ne se joue pas (contenu qui disparaît d'un coup).
 * En figeant le contexte, la page sortante reste intacte le temps de son exit.
 */
function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext);
  // Capture once at mount and never update — figeant le contexte de cette
  // instance de page (le setter est volontairement ignoré).
  const [frozen] = useState(context);

  if (!frozen) return <>{children}</>;
  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

/**
 * Transition de route générique : crossfade intro/outro (0.26s).
 * - `mode="wait"` : l'outro de la page sortante se termine avant l'intro de
 *   la suivante.
 * - `initial={false}` : pas d'animation au tout premier chargement (refresh).
 * - FrozenRouter : garantit que l'outro se joue réellement en App Router.
 *
 * Les pages avec leur propre orchestration (WorkGrid stagger, canvas /play)
 * s'animent par-dessus ce crossfade de base.
 */
export function ClientAnimationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.26, ease: "easeInOut" }}
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
