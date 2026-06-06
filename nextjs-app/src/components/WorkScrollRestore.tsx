"use client";

import { useEffect } from "react";

const SCROLL_KEY = "work:scrollY";

/**
 * Restaure la position de scroll de /work après un nav-back depuis un projet.
 * La valeur est sauvegardée dans ProjectCard au clic, lue ici au mount,
 * puis immédiatement supprimée pour ne pas interférer avec les visites directes.
 */
export function WorkScrollRestore() {
  useEffect(() => {
    const raw = sessionStorage.getItem(SCROLL_KEY);
    if (!raw) return;
    sessionStorage.removeItem(SCROLL_KEY);
    const y = Number(raw);
    if (Number.isFinite(y) && y > 0) {
      window.scrollTo({ top: y, behavior: "instant" });
    }
  }, []);

  return null;
}

export { SCROLL_KEY };
