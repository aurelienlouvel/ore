import type LocomotiveScroll from "locomotive-scroll";

/**
 * Pont vers l'instance LocomotiveScroll/Lenis active.
 *
 * Deux modèles de scroll coexistent :
 * - /work et /work/* scrollent DANS un container fixe (<PageShell>) → `scrollEl`
 *   pointe sur ce container, pour une View Transition propre même scrollé.
 * - /play, /info scrollent sur `window` → `scrollEl` est null.
 *
 * Lenis pilote le scroll : un `scrollTo` natif est écrasé au tick rAF suivant.
 * Pour des sauts FIABLES on agit sur les deux : natif (snapshot VT synchrone) +
 * Lenis (état interne).
 */
let loco: LocomotiveScroll | null = null;
let scrollEl: HTMLElement | null = null; // null = scroll document (window)

export function registerScroll(
  instance: LocomotiveScroll,
  el: HTMLElement | null,
) {
  loco = instance;
  scrollEl = el;
}

export function unregisterScroll(instance: LocomotiveScroll) {
  if (loco === instance) {
    loco = null;
    scrollEl = null;
  }
}

function setNativeScroll(y: number) {
  if (scrollEl) scrollEl.scrollTop = y;
  else window.scrollTo(0, y);
}

/** Position de scroll courante du container actif (vérité terrain). */
export function getScrollY(): number {
  return scrollEl ? scrollEl.scrollTop : window.scrollY;
}

/** Saut instantané vers le haut — natif + Lenis. */
export function jumpToTop() {
  setNativeScroll(0);
  loco?.scrollTo(0, { immediate: true, force: true });
}

/** Saut instantané vers `y` — natif + Lenis. */
export function jumpTo(y: number) {
  setNativeScroll(y);
  loco?.scrollTo(y, { immediate: true, force: true });
}

/** Clé sessionStorage de la position de scroll de /work (save au clic card). */
export const WORK_SCROLL_KEY = "work:scrollY";

/**
 * Drapeau « retour vers /work depuis un projet » (posé par le bouton retour).
 * Évite de rejouer l'intro de la grille au retour (sinon snapshot VT vide).
 * Flag module (et non sessionStorage) : toujours `false` au SSR → zéro mismatch.
 */
let workReturn = false;
export function markWorkReturn() {
  workReturn = true;
}
export function peekWorkReturn() {
  return workReturn;
}
export function clearWorkReturn() {
  workReturn = false;
}
