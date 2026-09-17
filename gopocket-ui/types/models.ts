import { TransactionType } from "./transaction-type";

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type ActualTransaction = {
  id: string;
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  category_ids: string[];
  paid_at: string;
};

export type PlannedTransaction = {
  id: string;
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  category_ids: string[];
  paid_at: string;
  due_at: string;
};

export type CreateCategoryPayload = {
  name: string;
  color: string;
};

export type UpdateCategoryPayload = {
  name?: string;
  color?: string;
};

export interface CreateActualTransactionPayload {
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  category_ids: string[];
  paid_at: string;
}

export interface CreatePlannedTransactionPayload {
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  category_ids: string[];
  due_at: string;
}

export interface CreateBulkPlannedTransactionsPayload {
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  category_ids: string[];
  due_day: number;
  /** "YYYY-MM" */
  start_month: string;
  /** "YYYY-MM" */
  end_month: string;
}

export type UpdateTransactionPayload = {
  title?: string;
  description?: string;
  amount?: number;
  type?: TransactionType;
  category_ids?: string[];
  paid_at?: string;
};

export type TransactionListFilters = {
  q?: string;
  category_ids?: string[];
  type?: TransactionType;
  /** RFC3339 timestamp. */
  start_date?: string;
  /** RFC3339 timestamp, or the literal "now". */
  end_date?: string;
};

export const dashboardModes = ["month", "year"] as const;
export type DashboardMode = (typeof dashboardModes)[number];

export type DashboardTrend = { label: string; balance: number };
export type DashboardExpense = { category: string; amount: number };

export type DashboardData = {
  mode: DashboardMode;
  start_date: string;
  end_date: string;
  summary: {
    total_balance: number;
    total_income: number;
    total_expenses: number;
  };
  trend: DashboardTrend[];
  expenses: DashboardExpense[];
  recent_transactions: ActualTransaction[];
  page: number;
  page_size: number;
  total_transactions: number;
  total_pages: number;
};
