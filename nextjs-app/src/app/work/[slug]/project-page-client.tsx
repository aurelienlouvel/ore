"use client";

import { useEffect } from "react";
import { useActionBar } from "@/contexts/action-bar-context";

interface ProjectPageClientProps {
  title: string;
  redirectUrl: string | null;
}

export function ProjectPageClient({ title, redirectUrl }: ProjectPageClientProps) {
  const { setProjectMode, setNavMode } = useActionBar();

  useEffect(() => {
    setProjectMode({ title, redirectUrl });
    return () => {
      setNavMode();
    };
  }, [title, redirectUrl, setProjectMode, setNavMode]);

  return null;
}
