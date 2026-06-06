"use client";

import { useEffect } from "react";
import { useActionBar } from "@/contexts/ActionBarContext";

export function ProjectPageClient({
  title,
  redirectUrl,
}: {
  title: string;
  redirectUrl: string | null;
}) {
  const { setProject, clearProject } = useActionBar();

  // Scroll immédiat en haut à l'arrivée sur la page projet
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    setProject({ title, redirectUrl });
    return () => clearProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, redirectUrl]);

  return null;
}
