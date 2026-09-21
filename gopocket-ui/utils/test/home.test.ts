import type { Goal, PlannedTransaction } from "@/types/models";
import { TransactionType } from "@/types/transaction-type";
import {
  daysUntil,
  goalsByMonth,
  paginate,
  sortByDueDate,
  summarizePlanned,
} from "../home";

// Local time, so these hold in any timezone the tests run in.
const now = new Date(2026, 8, 21, 10, 0, 0); // 21 Sep 2026

const planned = (id: string, dueAt: Date, amount: number): PlannedTransaction => ({
  id,
  title: id,
  description: "",
  amount,
  type: TransactionType.EXPENSE,
  category_ids: [],
  paid_at: "",
  due_at: dueAt.toISOString(),
});

const goal = (id: string, dueAt: string | null): Goal => ({
  id,
  name: id,
  description: "",
  total_amount: 1000,
  due_at: dueAt,
  paid_amount: 0,
  committed_amount: 0,
  remaining_amount: 1000,
  paid_percent: 0,
  committed_percent: 0,
  days_left: null,
  monthly_needed: null,
  transaction_count: 0,
});

describe("daysUntil", () => {
  it("counts calendar days regardless of the time of day", () => {
    expect(daysUntil(new Date(2026, 8, 21, 23, 59).toISOString(), now)).toBe(0);
    expect(daysUntil(new Date(2026, 8, 22, 0, 1).toISOString(), now)).toBe(1);
    expect(daysUntil(new Date(2026, 8, 30, 12).toISOString(), now)).toBe(9);
  });

  it("is negative once overdue", () => {
    expect(daysUntil(new Date(2026, 8, 20, 12).toISOString(), now)).toBe(-1);
  });

  it("reads a date-only string as a local day", () => {
    expect(daysUntil("2026-09-25", now)).toBe(4);
  });
});

describe("summarizePlanned", () => {
  it("splits this month (overdue included) from next month and ignores the rest", () => {
    const summary = summarizePlanned(
      [
        planned("overdue", new Date(2026, 7, 30, 12), 100),
        planned("today", new Date(2026, 8, 21, 12), 200),
        planned("month-end", new Date(2026, 8, 30, 12), 300),
        planned("next-first", new Date(2026, 9, 1, 12), 400),
        planned("next-last", new Date(2026, 9, 31, 12), 500),
        planned("later", new Date(2026, 10, 1, 12), 600),
      ],
      now,
    );

    expect(summary).toEqual({
      thisMonthAmount: 600,
      thisMonthCount: 3,
      nextMonthAmount: 900,
      nextMonthCount: 2,
    });
  });

  it("rolls over the year", () => {
    const december = new Date(2026, 11, 15);
    const summary = summarizePlanned(
      [planned("jan", new Date(2027, 0, 10, 12), 700)],
      december,
    );

    expect(summary.nextMonthAmount).toBe(700);
    expect(summary.thisMonthAmount).toBe(0);
  });
});

describe("sortByDueDate", () => {
  it("orders soonest first without mutating the input", () => {
    const input = [
      planned("b", new Date(2026, 9, 5, 12), 1),
      planned("a", new Date(2026, 8, 1, 12), 1),
      planned("c", new Date(2026, 11, 5, 12), 1),
    ];

    expect(sortByDueDate(input).map((p) => p.id)).toEqual(["a", "b", "c"]);
    expect(input.map((p) => p.id)).toEqual(["b", "a", "c"]);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1);

  it("returns ten at a time by default", () => {
    const first = paginate(items, 1);
    expect(first.items).toEqual(items.slice(0, 10));
    expect(first).toMatchObject({ page: 1, totalPages: 3, from: 1, to: 10, total: 25 });

    const last = paginate(items, 3);
    expect(last.items).toEqual([21, 22, 23, 24, 25]);
    expect(last).toMatchObject({ from: 21, to: 25 });
  });

  it("clamps an out-of-range page", () => {
    expect(paginate(items, 99).page).toBe(3);
    expect(paginate(items, 0).page).toBe(1);
  });

  it("handles an empty list", () => {
    expect(paginate([], 1)).toMatchObject({
      items: [],
      page: 1,
      totalPages: 1,
      from: 0,
      to: 0,
      total: 0,
    });
  });
});

describe("goalsByMonth", () => {
  it("groups by due month, ordered by due date, skipping goals without one", () => {
    const result = goalsByMonth(
      [
        goal("late-this", "2026-09-30"),
        goal("early-this", "2026-09-02"),
        goal("next", "2026-10-15"),
        goal("later", "2026-11-01"),
        goal("earlier", "2026-08-31"),
        goal("none", null),
      ],
      now,
    );

    expect(result.thisMonth.map((g) => g.id)).toEqual(["early-this", "late-this"]);
    expect(result.nextMonth.map((g) => g.id)).toEqual(["next"]);
  });

  it("rolls over the year", () => {
    const result = goalsByMonth([goal("jan", "2027-01-20")], new Date(2026, 11, 15));
    expect(result.nextMonth.map((g) => g.id)).toEqual(["jan"]);
  });
});
