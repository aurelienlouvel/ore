"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import type { ArtifactCanvasItem } from "@/sanity/queries";
import { InfiniteCanvas } from "./InfiniteCanvas";
import { triggerOutro, OUTRO_DURATION, OUTRO_STAGGER_MAX } from "@/lib/artifact-utils";
import { EASE_IN_OUT_CSS } from "@/lib/easings";

// Crossfade de sortie — voile blanc + cards fondent ensemble, révélant la page.
const FADE_OUT_MS = 470;
// Fade-in d'entrée — masque la frame résiduelle de la visite précédente
// (cards à zoom 1) le temps que l'intro three (reset opacity 0 + dezoom) prenne.
const FADE_IN_MS  = 280;
// Le canvas reste monté le temps de l'outro three + du crossfade de sortie.
const EXIT_TOTAL  = Math.max(OUTRO_DURATION + OUTRO_STAGGER_MAX, FADE_OUT_MS) + 60;
// Délai d'entrée : court, pour réduire l'écran vide entre la page sortante et
// le canvas. Le fade-in (expo.inOut, lent au départ) reste transparent au début
// → la vague d'outro de la page reste visible dessous, puis le canvas prend le relais.
const ENTER_DELAY = 260;

/**
 * Wrapper persistant — monté une fois, jamais démonté.
 *
 * - Entrée /play : après ENTER_DELAY, fade-in (opacity 0→1, FADE_IN_MS) pendant
 *                  que l'intro three se met en place (reset des cards + dezoom).
 *                  Le fade-in masque la frame résiduelle (cards à zoom 1) qui,
 *                  en révélation instantanée, causait un flash avant le dezoom.
 * - Sortie /play : outro des cards + crossfade du conteneur (opacity → 0) qui
 *                  efface le voile blanc et révèle la page suivante, sans
 *                  palier blanc. Caché après EXIT_TOTAL.
 */
export function PlayCanvas({ artifacts }: { artifacts: ArtifactCanvasItem[] }) {
  const pathname = usePathname();
  const isPlay   = pathname === "/play";

  const [active,  setActive]  = useState(isPlay);
  const [running, setRunning] = useState(isPlay);
  const [visible, setVisible] = useState(isPlay);
  const [opacity, setOpacity] = useState(isPlay ? 1 : 0);
  // transition CSS opacity — activée pendant les fades d'entrée/sortie
  const [fading,  setFading]  = useState(false);
  const [fadeMs,  setFadeMs]  = useState(FADE_OUT_MS);
  // expo.inOut : démarrage lent → l'opacity reste très basse les 1ères frames,
  // ce qui masque aussi la frame résiduelle (cards à zoom 1) à l'entrée.
  const [fadeEase, setFadeEase] = useState<string>(EASE_IN_OUT_CSS);

  const prevIsPlay = useRef(isPlay);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const wasPlay = prevIsPlay.current;
    prevIsPlay.current = isPlay;
    if (timerRef.current) clearTimeout(timerRef.current);

    if (isPlay && !wasPlay) {
      // ── Entrée /play ─────────────────────────────────────────────
      setRunning(true);
      timerRef.current = setTimeout(() => {
        setFading(true);        // fade-in (et non révélation instantanée)
        setFadeMs(FADE_IN_MS);
        setFadeEase(EASE_IN_OUT_CSS);
        setVisible(true);
        setActive(true);        // → déclenche l'intro (reset cards + dezoom)
        setOpacity(1);
      }, ENTER_DELAY);
    } else if (!isPlay && wasPlay) {
      // ── Sortie /play ─────────────────────────────────────────────
      triggerOutro();       // mouvement d'outro des cards (three.js)
      setActive(false);     // coupe les interactions / focus
      setRunning(true);     // garde le frameloop pour jouer l'outro
      setVisible(true);     // reste visible le temps du crossfade
      setFading(true);      // active la transition CSS
      setFadeMs(FADE_OUT_MS);
      setFadeEase(EASE_IN_OUT_CSS);
      setOpacity(0);        // voile blanc + cards fondent → révèle la page
      timerRef.current = setTimeout(() => {
        setRunning(false);
        setVisible(false);
      }, EXIT_TOTAL);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlay]);

  return (
    <div
      data-lenis-prevent
      style={{
        position:      "fixed",
        inset:         0,
        opacity,
        transition:    fading ? `opacity ${fadeMs}ms ${fadeEase}` : "none",
        visibility:    visible ? "visible" : "hidden",
        pointerEvents: active  ? "auto"    : "none",
        zIndex:        visible ? 0         : -1,
      }}
    >
      <InfiniteCanvas artifacts={artifacts} active={active} running={running} />
    </div>
  );
}
