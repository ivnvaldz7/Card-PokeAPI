"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Button } from "@/shared/ui/Button";

type Theme = "light" | "dark";

const getPreferredTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

let currentTheme: Theme = "light";
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => currentTheme;

const setThemeValue = (next: Theme) => {
  currentTheme = next;
  listeners.forEach((listener) => listener());
};

export const ThemeToggle = () => {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "light");

  useEffect(() => {
    const initial = getPreferredTheme();
    document.documentElement.dataset.theme = initial;
    setThemeValue(initial);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("theme", next);
    setThemeValue(next);
  };

  return (
    <Button
      variant="ghost"
      onClick={toggle}
      aria-pressed={theme === "dark"}
    >
      {theme === "dark" ? "Modo claro" : "Modo oscuro"}
    </Button>
  );
};
