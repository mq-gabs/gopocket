import type { TranslateFunction } from "@/contexts/i18n-context";

/** "Due today", "3 days left" or "2 days overdue" for a day count from utils/home's daysUntil. */
export const daysLabel = (days: number, t: TranslateFunction): string => {
  if (days === 0) return t("goals.summary.dueToday");
  if (days > 0) {
    return `${days} ${t(days === 1 ? "goals.summary.dayLeft" : "goals.summary.daysLeft")}`;
  }
  return `${-days} ${t(days === -1 ? "goals.summary.dayOverdue" : "goals.summary.daysOverdue")}`;
};
