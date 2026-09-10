"use client";

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/contexts/theme-context";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <label className="flex items-center gap-2 rounded-xl bg-background px-2 py-1 text-xs cursor-pointer">
      <SunIcon className="h-4 w-4" />
      <input
        type="checkbox"
        className="toggle toggle-sm cursor-pointer"
        checked={theme === "dark"}
        onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
      <MoonIcon className="h-4 w-4" />
    </label>
  );
}
