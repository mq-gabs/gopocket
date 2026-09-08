export type TransactionType = "EXPENSE" | "INCOME";

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  category_id: string;
  transaction_date: string;
  category?: Category;
}

export interface CreateCategoryPayload {
  name: string;
  color: string;
  icon: string;
  type: TransactionType;
}

export interface UpdateCategoryPayload {
  name?: string;
  color?: string;
  icon?: string;
  type?: TransactionType;
}

export interface CreateTransactionPayload {
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  category_id: string;
  transaction_date?: string;
}

export interface UpdateTransactionPayload {
  title?: string;
  description?: string;
  amount?: number;
  type?: TransactionType;
  category_id?: string;
  transaction_date?: string;
}

export interface DashboardData {
  mode: "month" | "year";
  start_date: string;
  end_date: string;
  summary: {
    total_balance: number;
    total_income: number;
    total_expenses: number;
  };
  trend: Array<{ label: string; balance: number }>;
  expenses: Array<{ category: string; amount: number }>;
  recent_transactions: Transaction[];
  page: number;
  page_size: number;
  total_transactions: number;
  total_pages: number;
}
