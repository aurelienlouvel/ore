import { buildImageUrl } from "./sanity-image";
import type { ArtifactCanvasItem } from "@/sanity/queries";

// ─── Card dimensions ──────────────────────────────────────────────────────────
// CARD_W is fixed; CARD_H is the grid-spacing reference (not per-card height).
// Per-card height is computed by getCardHeight() from actual media dimensions.
export const CARD_W     = 340;
export const CARD_H     = 250; // grid reference / default fallback
export const MIN_CARD_H = 100; // allow very wide content
export const MAX_CARD_H = 700; // allow up to 9:16 portrait (604 px < 700)

// ─── Runtime video dimension cache ───────────────────────────────────────────
// Sanity ne stocke pas les métadonnées des vidéos (dimensions).
// On détecte le ratio au runtime via loadedmetadata et on le met en cache ici.
// Map : artifactId → cardH calculée à partir de videoWidth/videoHeight.
export const _videoDimsCache = new Map<string, number>();

/**
 * Hauteur réelle d'une card d'après les dimensions de son média.
 * - Images  : utilise imageWidth / imageHeight de Sanity (asset metadata)
 * - Vidéos  : utilise _videoDimsCache si disponible, sinon 16:9 par défaut
 * Clampée dans [MIN_CARD_H, MAX_CARD_H].
 */
export function getCardHeight(artifact: ArtifactCanvasItem): number {
  const m = artifact.firstMedia;
  if (m?._type === "galleryImage" && m.imageWidth && m.imageHeight && m.imageWidth > 0) {
    const h = Math.round(CARD_W * m.imageHeight / m.imageWidth);
    return Math.max(MIN_CARD_H, Math.min(MAX_CARD_H, h));
  }
  if (m?._type === "galleryVideo") {
    const cached = _videoDimsCache.get(artifact._id);
    if (cached) return cached; // ratio détecté au runtime
    return Math.round(CARD_W * 9 / 16); // 191 px — fallback 16:9 en attendant
  }
  return CARD_H;
}

// ─── Intro animation state (module-level — survives remounts / soft-navs) ──────
//
//  `version` increments each time the intro fires so cards can detect a new
//  cycle even if the component never unmounted.
//  `startTime` is performance.now() at trigger time; cards use it + their own
//  stagger delay to compute opacity / scale.
//
export const introState = {
  version:   0,
  startTime: -Infinity as number,
};

export function triggerIntro(): void {
  introState.version  += 1;
  introState.startTime = typeof performance !== "undefined" ? performance.now() : 0;
}

// ─── Focus dim state ──────────────────────────────────────────────────────────
// When a card is focused, all other cards dim toward DIM_OPACITY.
export const focusState = { isActive: false };
export const DIM_OPACITY = 0;

/**
 * Retourne l'URL de l'image de couverture d'un artifact.
 * Importable partout (server + client), aucune dépendance browser.
 */
export function getArtifactImageUrl(artifact: ArtifactCanvasItem): string | null {
  const m = artifact.firstMedia;
  if (!m || m._type === "galleryVideo") return null;
  return m.imageRef
    ? buildImageUrl(m.imageRef, m.imageUrl, m.imageHotspot, m.imageCrop)
    : (m.imageUrl ?? null);
}
