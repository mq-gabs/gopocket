import {
  addMonths,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfMonth,
} from "date-fns";
import type { Goal, PlannedTransaction } from "@/types/models";

export const UPCOMING_PAGE_SIZE = 10;

/**
 * Calendar days from `now` until `dueAt` (RFC3339 or "YYYY-MM-DD"): 0 is
 * today and negative once overdue.
 */
export const daysUntil = (dueAt: string, now: Date): number =>
  differenceInCalendarDays(parseISO(dueAt), now);

const monthKey = (date: Date): string => format(date, "yyyy-MM");

export type PlannedSummary = {
  /**
   * Unpaid amount due up to the end of the current month. Includes anything
   * already overdue, since it still has to be paid.
   */
  thisMonthAmount: number;
  thisMonthCount: number;
  /** Unpaid amount due next month. */
  nextMonthAmount: number;
  nextMonthCount: number;
};

/** Splits planned transactions into what is still due this month and next. */
export const summarizePlanned = (
  planned: PlannedTransaction[],
  now: Date,
): PlannedSummary => {
  const nextMonthStart = startOfMonth(addMonths(now, 1));
  const monthAfterStart = startOfMonth(addMonths(now, 2));

  const summary: PlannedSummary = {
    thisMonthAmount: 0,
    thisMonthCount: 0,
    nextMonthAmount: 0,
    nextMonthCount: 0,
  };

  for (const item of planned) {
    const due = parseISO(item.due_at);
    if (due < nextMonthStart) {
      summary.thisMonthAmount += item.amount;
      summary.thisMonthCount += 1;
    } else if (due < monthAfterStart) {
      summary.nextMonthAmount += item.amount;
      summary.nextMonthCount += 1;
    }
  }

  return summary;
};

/** Planned transactions from the soonest due date (overdue first) to the latest. */
export const sortByDueDate = (
  planned: PlannedTransaction[],
): PlannedTransaction[] =>
  [...planned].sort(
    (a, b) => parseISO(a.due_at).getTime() - parseISO(b.due_at).getTime(),
  );

export type Page<T> = {
  items: T[];
  /** 1-based, clamped into the valid range. */
  page: number;
  totalPages: number;
  /** 1-based position of the first/last item on the page; 0 when empty. */
  from: number;
  to: number;
  total: number;
};

export const paginate = <T>(
  items: T[],
  page: number,
  pageSize: number = UPCOMING_PAGE_SIZE,
): Page<T> => {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);

  return {
    items: slice,
    page: current,
    totalPages,
    from: slice.length === 0 ? 0 : start + 1,
    to: start + slice.length,
    total: items.length,
  };
};

export type GoalsByMonth = {
  thisMonth: Goal[];
  nextMonth: Goal[];
};

/** Goals whose due date falls in the current or the next calendar month. */
export const goalsByMonth = (goals: Goal[], now: Date): GoalsByMonth => {
  const thisKey = monthKey(now);
  const nextKey = monthKey(addMonths(now, 1));

  const byDueDate = (a: Goal, b: Goal) =>
    (a.due_at ?? "").localeCompare(b.due_at ?? "");

  const dueIn = (key: string) =>
    goals.filter((goal) => goal.due_at?.slice(0, 7) === key).sort(byDueDate);

  return { thisMonth: dueIn(thisKey), nextMonth: dueIn(nextKey) };
};
