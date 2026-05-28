"use client";

import { useEffect } from "react";

/**
 * Déclenche le pré-téléchargement des images du canvas `/play`
 * dès le montage du layout racine, via requestIdleCallback.
 *
 * crossOrigin = "anonymous" doit correspondre au mode utilisé par
 * Three.js TextureLoader — sinon le navigateur garde deux entrées
 * de cache séparées et les requêtes Three.js ne bénéficient pas du cache.
 */
export function ArtifactImagePrefetch({ urls }: { urls: string[] }) {
  useEffect(() => {
    if (!urls.length) return;

    const load = () => {
      urls.forEach((url) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // MUST match Three.js TextureLoader mode
        img.src = url;
      });
    };

    // requestIdleCallback = télécharge quand le thread principal est libre
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(load, { timeout: 3000 });
      return () => cancelIdleCallback(id);
    }

    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
