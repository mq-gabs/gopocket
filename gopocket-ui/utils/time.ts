import { Locale } from "@/locales";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatDate = (date: Date | string, locale: Locale): string => {
  if (locale === "pt-br") {
    return format(date, "dd/MM/yyyy", {
      locale: ptBR,
    });
  }

  return format(date, "MMM, dd yyyy");
};
