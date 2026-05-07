"use client";

import { useEffect } from "react";
import LocomotiveScroll from "locomotive-scroll";

export function ScrollInit() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const loco = new LocomotiveScroll({ lenisOptions: { lerp: 0.08 } });
    return () => loco.destroy();
  }, []);
  return null;
}
