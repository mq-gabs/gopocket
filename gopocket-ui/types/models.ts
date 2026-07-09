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
}

export interface UpdateTransactionPayload {
  title?: string;
  description?: string;
  amount?: number;
  type?: TransactionType;
  category_id?: string;
}
