import { Locale } from "@/locales";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/** "September 2026" / "setembro de 2026" */
export const formatMonth = (date: Date, locale: Locale): string =>
  locale === "pt-br"
    ? format(date, "MMMM 'de' yyyy", { locale: ptBR })
    : format(date, "MMMM yyyy");

export const formatDate =(date: Date | string, locale: Locale): string => {
  if (locale === "pt-br") {
    return format(date, "dd/MM/yyyy", {
      locale: ptBR,
    });
  }

  return format(date, "MMM, dd yyyy");
};
