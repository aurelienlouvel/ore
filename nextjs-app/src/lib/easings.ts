/**
 * Design system d'animations
 *
 * Philosophy:
 * - Fast
 * - Punchy
 * - Slight overshoot
 * - Feels physical
 */

// ───────────────────────────────────────────────────────────
// Signature : arrivée principale
// ───────────────────────────────────────────────────────────

export const EASE_PUNCH = [0.22, 1.3, 0.36, 1] as const;
export const EASE_PUNCH_CSS = "cubic-bezier(0.22, 1.3, 0.36, 1)";

// ───────────────────────────────────────────────────────────
// Entrées
// ───────────────────────────────────────────────────────────

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_OUT_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

// ───────────────────────────────────────────────────────────
// Sorties
// ───────────────────────────────────────────────────────────

export const EASE_IN = [0.64, 0, 0.78, 0] as const;
export const EASE_IN_CSS = "cubic-bezier(0.64, 0, 0.78, 0)";

// ───────────────────────────────────────────────────────────
// Morphing / Layout transitions
// ───────────────────────────────────────────────────────────

export const EASE_IN_OUT = [0.83, 0, 0.17, 1] as const;
export const EASE_IN_OUT_CSS = "cubic-bezier(0.83, 0, 0.17, 1)";

// ───────────────────────────────────────────────────────────
// Très juicy (hover, curseur, petites cartes)
// ───────────────────────────────────────────────────────────

export const EASE_BOUNCE = [0.34, 1.8, 0.64, 1] as const;
export const EASE_BOUNCE_CSS = "cubic-bezier(0.34, 1.8, 0.64, 1)";

export function easeOutBack(t: number, overshoot = 2.2): number {
  const c1 = overshoot;
  const c3 = c1 + 1;

  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -8 * t);
}

export function easeInOutExpo(t: number): number {
  if (t === 0) return 0;
  if (t === 1) return 1;

  return t < 0.5
    ? Math.pow(2, 16 * t - 8) / 2
    : (2 - Math.pow(2, -16 * t + 8)) / 2;
}

/**
 * inOutBack — départ lent (léger recul), overshoot, puis retour à la cible avec
 * VITESSE NULLE (settle doux). Le bounce ne se coupe plus net à l'arrivée.
 */
export function easeInOutBack(t: number, overshoot = 1.7): number {
  const c2 = overshoot * 1.525;
  return t < 0.5
    ? ((2 * t) ** 2 * ((c2 + 1) * 2 * t - c2)) / 2
    : ((2 * t - 2) ** 2 * ((c2 + 1) * (2 * t - 2) + c2) + 2) / 2;
}

// ───────────────────────────────────────────────────────────
// Zoom caméra (/play) — overshoot puis settle DOUX (vitesse nulle à l'arrivée).
// ───────────────────────────────────────────────────────────

export const easeZoom = (t: number) => easeInOutBack(t, 1.6);
