import { en } from "./en";
import { ptBr } from "./pt-br";

export type Locale = "en" | "pt-br";
export const dictionaries = {
  en,
  "pt-br": ptBr,
} as const;

export type TranslationKey = keyof typeof en;
