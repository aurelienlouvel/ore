"use client";

import { useEffect } from "react";
import LocomotiveScroll from "locomotive-scroll";

export function ScrollInit() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
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
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
      },
    });
    return () => locomotiveScroll.destroy();
  }, []);
  return null;
}
