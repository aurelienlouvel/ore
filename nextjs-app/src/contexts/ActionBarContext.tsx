"use client";

import { createContext, useContext, useState } from "react";

type ProjectBarData = { title: string; redirectUrl: string | null };

type ActionBarContextType = {
  mode: "nav" | "project";
  projectData: ProjectBarData | null;
  setProject: (data: ProjectBarData) => void;
  clearProject: () => void;
};

const ActionBarContext = createContext<ActionBarContextType | null>(null);

export function ActionBarProvider({ children }: { children: React.ReactNode }) {
  const [projectData, setProjectData] = useState<ProjectBarData | null>(null);

  return (
    <ActionBarContext.Provider
      value={{
        mode: projectData ? "project" : "nav",
        projectData,
        setProject: setProjectData,
        clearProject: () => setProjectData(null),
      }}
    >
      {children}
    </ActionBarContext.Provider>
  );
}

export function useActionBar() {
  const ctx = useContext(ActionBarContext);
  if (!ctx) throw new Error("useActionBar must be used within ActionBarProvider");
  return ctx;
}
