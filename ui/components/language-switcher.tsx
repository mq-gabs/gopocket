"use client";

import { useI18n } from "@/contexts/i18n-context";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <label className="flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-3 py-2 text-sm">
      <span>{t("language.label")}</span>
      <select
        className="select select-sm select-bordered bg-transparent"
        value={locale}
        onChange={(event) => setLocale(event.target.value as "en" | "pt-br")}
      >
        <option value="en">{t("language.english")}</option>
        <option value="pt-br">{t("language.portuguese")}</option>
      </select>
    </label>
  );
}
