"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type ActionBarMode = "nav" | "project";

export interface ActionBarProjectData {
  title: string;
  redirectUrl: string | null;
}

interface ActionBarContextValue {
  mode: ActionBarMode;
  projectData: ActionBarProjectData | null;
  setProjectMode: (data: ActionBarProjectData) => void;
  setNavMode: () => void;
}

const ActionBarContext = createContext<ActionBarContextValue | null>(null);

export function ActionBarProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ActionBarMode>("nav");
  const [projectData, setProjectData] = useState<ActionBarProjectData | null>(null);

  const setProjectMode = useCallback((data: ActionBarProjectData) => {
    setProjectData(data);
    setMode("project");
  }, []);

  const setNavMode = useCallback(() => {
    setMode("nav");
    setProjectData(null);
  }, []);

  return (
    <ActionBarContext.Provider value={{ mode, projectData, setProjectMode, setNavMode }}>
      {children}
    </ActionBarContext.Provider>
  );
}

export function useActionBar(): ActionBarContextValue {
  const ctx = useContext(ActionBarContext);
  if (!ctx) throw new Error("useActionBar must be used within ActionBarProvider");
  return ctx;
}
