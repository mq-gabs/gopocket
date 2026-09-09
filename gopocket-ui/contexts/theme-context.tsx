"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const themes = ["light", "dark"] as const;
export type ThemeMode = typeof themes[number];

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const THEME_KEY = "gopocket-theme"

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeMemo] = useState<ThemeMode>(window.localStorage.getItem(THEME_KEY) as ThemeMode || "light");
  
  const setTheme = (theme: ThemeMode) => {
    console.log({ theme })
    if (!themes.includes(theme)) {
      return
    }

    setThemeMemo(theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY) as ThemeMode | null;
    if (stored && themes.includes(stored)) {
      setTheme(stored);
      return;
    }

    setTheme("light")
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
