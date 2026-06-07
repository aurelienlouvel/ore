"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import LocomotiveScroll from "locomotive-scroll";
import { registerScroll, unregisterScroll } from "@/lib/scroll";

// /work et /work/* gèrent leur scroll via <PageShell> (container fixe).
const isShellRoute = (p: string) => p === "/work" || p.startsWith("/work/");

/**
 * Smooth-scroll sur `window` pour les routes SANS PageShell (/play, /info, …).
 * Sur les routes work, PageShell crée son propre Lenis scopé au container, donc
 * ici on ne fait rien (sinon deux Lenis en conflit).
 */
export function ScrollInit() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (isShellRoute(pathname)) return;

    const locomotiveScroll = new LocomotiveScroll({
      lenisOptions: {
        wrapper: window,
        content: document.documentElement,
        lerp: 0.1,
        duration: 1.2,
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      },
    });
    registerScroll(locomotiveScroll, null);

    return () => {
      unregisterScroll(locomotiveScroll);
      locomotiveScroll.destroy();
    };
  }, [pathname]);

  return null;
}
