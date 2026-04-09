import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type ContrastMode = "default" | "high";

type ContrastModeContextValue = {
  contrastMode: ContrastMode;
  isHighContrast: boolean;
  toggleContrastMode: () => void;
};

const STORAGE_KEY = "mind-architecture-contrast-mode";

const ContrastModeContext = createContext<ContrastModeContextValue | undefined>(undefined);

export const ContrastModeProvider = ({ children }: { children: ReactNode }) => {
  const [contrastMode, setContrastMode] = useState<ContrastMode>(() => {
    if (typeof window === "undefined") return "default";
    const savedMode = window.localStorage.getItem(STORAGE_KEY);
    return savedMode === "high" ? "high" : "default";
  });

  useEffect(() => {
    document.documentElement.dataset.contrastMode = contrastMode;
    window.localStorage.setItem(STORAGE_KEY, contrastMode);
  }, [contrastMode]);

  const value = useMemo(
    () => ({
      contrastMode,
      isHighContrast: contrastMode === "high",
      toggleContrastMode: () =>
        setContrastMode((currentMode) => (currentMode === "high" ? "default" : "high")),
    }),
    [contrastMode],
  );

  return <ContrastModeContext.Provider value={value}>{children}</ContrastModeContext.Provider>;
};

export const useContrastMode = () => {
  const context = useContext(ContrastModeContext);
  if (!context) {
    throw new Error("useContrastMode must be used within a ContrastModeProvider");
  }

  return context;
};
