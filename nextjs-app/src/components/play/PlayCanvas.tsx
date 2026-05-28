"use client";

import { usePathname } from "next/navigation";
import type { ArtifactCanvasItem } from "@/sanity/queries";
import { InfiniteCanvas } from "./InfiniteCanvas";

/**
 * Wrapper persistant — monté une fois dans le root layout, jamais démonté.
 * Quand on est sur /play : visible + interactif + frameloop actif.
 * Sur toutes les autres pages : caché (visibility: hidden) + pas d'événements
 * + frameloop arrêté (GPU au repos).
 */
export function PlayCanvas({ artifacts }: { artifacts: ArtifactCanvasItem[] }) {
  const pathname = usePathname();
  const isPlay   = pathname === "/play";

  return (
    <div
      data-lenis-prevent
      style={{
        position:      "fixed",
        inset:         0,
        visibility:    isPlay ? "visible" : "hidden",
        pointerEvents: isPlay ? "auto"    : "none",
        zIndex:        isPlay ? 0         : -1,
      }}
    >
      <InfiniteCanvas artifacts={artifacts} active={isPlay} />
    </div>
  );
}
