"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries, Locale, LOCALES, TranslationKey } from "@/locales";

export type TranslateFunction = (key: TranslationKey) => string;

const LOCAL_KEY = "gopocket-locale";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFunction;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCAL_KEY) as Locale | null;

    if (stored && LOCALES.includes(stored)) {
      setLocale(stored);
    }
  }, []);

  useEffect(() => {
    if (!locale) return;

    document.documentElement.lang = locale;
    window.localStorage.setItem("gopocket-locale", locale);
  }, [locale]);

  const value: I18nContextValue = useMemo(
    () => ({
      locale: locale || 'en',
      setLocale,
      t: (key: TranslationKey) =>
        locale ? dictionaries[locale][key] : "<missing translation>",
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
