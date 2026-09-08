import { Locale } from "@/locales";
import { format } from "date-fns";

export const formatDate = (date: Date, locale: Locale): string => {
  if (locale === "pt-br") {
    return format(date, "dd 'de' MMMM 'de' yyyy");
  }

  return format(date, "MMM, dd yyyy");
};
