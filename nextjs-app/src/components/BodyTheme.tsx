"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Anime la background-color du body selon la page active.
 * - /work/[slug] → rgb(184 184 184) (blanc × brightness 0.72)
 * - tout le reste → #ffffff
 * La transition CSS sur body synchronise l'animation avec le drawer.
 */
export function BodyTheme() {
  const pathname = usePathname();
  const isProject = /^\/work\/.+/.test(pathname);

  useEffect(() => {
    document.body.classList.toggle("body-project", isProject);
  }, [isProject]);

  return null;
}
