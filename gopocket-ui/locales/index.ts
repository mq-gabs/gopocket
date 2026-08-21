import { en } from "./en";
import { ptBr } from "./pt-br";

export const LOCALES = ['en', 'pt-br'] as const
export type Locale = typeof LOCALES[number]
export const dictionaries = {
  en,
  "pt-br": ptBr,
} as const;

export type TranslationKey = keyof typeof en;

export const isLocale = (value: unknown): value is Locale => {
  return typeof value === 'string' && LOCALES.includes(value as Locale)   
}