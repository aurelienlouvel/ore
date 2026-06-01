"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { PlayCanvas } from "./PlayCanvas";
import type { ArtifactCanvasItem } from "@/sanity/queries";

// Module-level — survives navigations, flips to true on first /play visit
let _everMounted = false;

/**
 * Monte PlayCanvas une seule fois, au premier passage sur /play.
 * Avant ça : aucun contexte WebGL, aucune vidéo créée, zéro overhead sur /work.
 * Une fois monté, jamais démonté (canvas persistant).
 *
 * Le delay de 360 ms (> exit de route 260 ms + marge) fait en sorte que le
 * canvas ne monte qu'après la fin de la transition de route sortante.
 * Évite que la LoadingBar (z-90) flashe par-dessus la page sortante.
 */
export function PlayCanvasMount({ artifacts }: { artifacts: ArtifactCanvasItem[] }) {
  const pathname  = usePathname();
  const [mounted, setMounted] = useState(_everMounted);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pathname === "/play" && !_everMounted) {
      timerRef.current = setTimeout(() => {
        _everMounted = true;
        setMounted(true);
      }, 360); // exit 220ms + delay 120ms + buffer 20ms
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  if (!mounted) return null;
  return <PlayCanvas artifacts={artifacts} />;
}
