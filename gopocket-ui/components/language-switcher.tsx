"use client";

import { useI18n } from "@/contexts/i18n-context";

const options = [
  { value: "en", label: "English" },
  { value: "pt-br", label: "Português" },
];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <label className="flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-2 py-1 text-xs">
      <span>{t("language.label")}</span>
      <select
        className="select select-xs select-bordered cursor-pointer px-8"
        value={locale}
        onChange={(event) => setLocale(event.target.value as "en" | "pt-br")}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="cursor-pointer option"
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
