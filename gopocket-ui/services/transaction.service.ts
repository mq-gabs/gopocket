import { httpClient } from "./http-client";
import type { DashboardData, Transaction, CreateTransactionPayload, UpdateTransactionPayload } from "@/types/models";

const basePath = "/api/transactions";

export const transactionService = {
  getAll: () => httpClient.get<Transaction[]>(basePath),
  get: (id: string) => httpClient.get<Transaction>(`${basePath}/${id}`),
  create: (payload: CreateTransactionPayload) => httpClient.post<Transaction>(basePath, payload),
  update: (id: string, payload: UpdateTransactionPayload) => httpClient.patch<Transaction>(`${basePath}/${id}`, payload),
  delete: (id: string) => httpClient.delete<{ deleted: boolean }>(`${basePath}/${id}`),
  getDashboard: (mode: "month" | "year", date: string, page = 1) =>
    httpClient.get<DashboardData>(`/api/dashboard?mode=${mode}&date=${date}&page=${page}`),
};
