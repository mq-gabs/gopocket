"use client";

import { useI18n } from "@/contexts/i18n-context";
import { isLocale } from "@/locales";
import { LanguageIcon } from "@heroicons/react/24/outline";
import { ChangeEvent } from "react";

const options = [
  { value: "en", label: "English" },
  { value: "pt-br", label: "Português" },
];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  const makeChangeSelection = () => {
    return (e: ChangeEvent<HTMLSelectElement>) => {
      const { value } = e.target;

      if (isLocale(value)) {
        setLocale(value)
      }
    }
  }

  return (
    <label className="flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-2 py-1 text-xs">
      <LanguageIcon className="h-5 w-5" />
      <select
        className="select select-xs select-bordered cursor-pointer px-5"
        value={locale}
        onChange={makeChangeSelection()}
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
