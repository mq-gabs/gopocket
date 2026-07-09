"use client";

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useI18n } from "@/contexts/i18n-context";
import { useTheme } from "@/contexts/theme-context";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  return (
    <label className="flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-2 py-1 text-xs cursor-pointer hover:bg-foreground hover:text-background">
      <span>{t("theme.label")}</span>
      <input
        type="checkbox"
        className="toggle toggle-sm cursor-pointer"
        checked={theme === "dark"}
        onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
      {theme === "dark" ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
    </label>
  );
}
