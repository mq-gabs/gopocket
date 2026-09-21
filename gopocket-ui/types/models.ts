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
  /** Total amount in cents, split equally across the installments. */
  amount: number;
  type: TransactionType;
  category_ids: string[];
  installments: number;
  /** "YYYY-MM-DD" */
  first_due_at: string;
}

export type UpdateTransactionPayload = {
  title?: string;
  description?: string;
  amount?: number;
  type?: TransactionType;
  category_ids?: string[];
  paid_at?: string;
};

export type ImportRule = {
  term: string;
  category_ids: string[];
};

export type ImportNubankPayload = {
  general_category_ids: string[];
  rules: ImportRule[];
};

export type ImportJobStartedResponse = {
  job_id: string;
  status: string;
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

export type Goal = {
  id: string;
  name: string;
  description: string;
  /** Cents. */
  total_amount: number;
  /** "YYYY-MM-DD", or null for a goal with no deadline. */
  due_at: string | null;
  /** Cents: sum of linked transactions already paid. */
  paid_amount: number;
  /** Cents: sum of linked planned (unpaid) transactions. */
  committed_amount: number;
  /** Cents: what is neither paid nor committed yet. */
  remaining_amount: number;
  /** 0-100; together with committed_percent never exceeds 100. */
  paid_percent: number;
  committed_percent: number;
  /** Null without a due date; negative once overdue. */
  days_left: number | null;
  /** Cents per month needed to cover remaining_amount by the due date; null without a due date or once overdue. */
  monthly_needed: number | null;
  transaction_count: number;
};

export type CreateGoalPayload = {
  name: string;
  description: string;
  total_amount: number;
  due_at: string | null;
};

/** Replaces every field, so a null due_at clears the deadline. */
export type UpdateGoalPayload = CreateGoalPayload;
