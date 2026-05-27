import imageUrlBuilder from "@sanity/image-url";
import { projectId, dataset } from "@/sanity/env";

type Hotspot = { x: number; y: number; width: number; height: number };
type Crop = { top: number; bottom: number; left: number; right: number };

const builder = imageUrlBuilder({ projectId, dataset });

/**
 * Retourne l'URL avec crop/hotspot appliqués via le CDN Sanity.
 * Si ni crop ni hotspot ne sont définis, retourne l'URL brute (pas de transformation).
 */
export function buildImageUrl(
  ref: string,
  rawUrl: string | null,
  hotspot?: Hotspot | null,
  crop?: Crop | null,
): string {
  if (!hotspot && !crop) return rawUrl ?? "";
  return builder
    .image({
      _type: "image",
      asset: { _type: "reference", _ref: ref },
      ...(hotspot && { hotspot }),
      ...(crop && { crop }),
    })
    .auto("format")
    .url();
}

/** Convertit le hotspot Sanity en valeur CSS object-position */
export function hotspotToObjectPosition(hotspot?: Hotspot | null): string {
  if (!hotspot) return "center";
  return `${hotspot.x * 100}% ${hotspot.y * 100}%`;
}
