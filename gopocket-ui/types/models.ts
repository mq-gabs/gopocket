import { TransactionType } from "./transaction-type";

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: TransactionType;
};

export type Transaction = {
  id: string;
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  category_id: string;
  paid_at: string;
  category?: Category;
};

export type CreateCategoryPayload = {
  name: string;
  color: string;
  icon: string;
  type: TransactionType;
};

export type UpdateCategoryPayload = {
  name?: string;
  color?: string;
  icon?: string;
  type?: TransactionType;
};

export interface CreateTransactionPayload {
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  category_id: string;
  paid_at?: string;
}

export type UpdateTransactionPayload = {
  title?: string;
  description?: string;
  amount?: number;
  type?: TransactionType;
  category_id?: string;
  paid_at?: string;
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
  recent_transactions: Transaction[];
  page: number;
  page_size: number;
  total_transactions: number;
  total_pages: number;
};
