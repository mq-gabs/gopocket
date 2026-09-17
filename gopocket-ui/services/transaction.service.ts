import { httpClient } from "./http-client";
import type {
  DashboardData,
  ActualTransaction,
  CreateActualTransactionPayload,
  UpdateTransactionPayload,
  CreatePlannedTransactionPayload,
  CreateBulkPlannedTransactionsPayload,
  PlannedTransaction,
  TransactionListFilters,
} from "@/types/models";

const join = (...paths: string[]): string => paths.join("/");

const basePath = "/api/transactions";

const basePathActual = join(basePath, "actual");
const basePathPlanned = join(basePath, "planned");
const basePathPlannedBulk = join(basePathPlanned, "bulk");

const buildListQuery = (filters?: TransactionListFilters): string => {
  if (!filters) return "";

  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.type) params.set("type", filters.type);
  if (filters.start_date) params.set("start_date", filters.start_date);
  if (filters.end_date) params.set("end_date", filters.end_date);
  filters.category_ids?.forEach((id) => params.append("category_ids", id));

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const transactionService = {
  getAllActual: (filters?: TransactionListFilters) =>
    httpClient.get<ActualTransaction[]>(
      `${basePathActual}${buildListQuery(filters)}`,
    ),
  getAllPlanned: (filters?: TransactionListFilters) =>
    httpClient.get<PlannedTransaction[]>(
      `${basePathPlanned}${buildListQuery(filters)}`,
    ),
  get: (id: string) => httpClient.get<ActualTransaction>(`${basePath}/${id}`),
  createActual: (payload: CreateActualTransactionPayload) =>
    httpClient.post<ActualTransaction>(basePathActual, payload),
  createPlanned: (payload: CreatePlannedTransactionPayload) =>
    httpClient.post<ActualTransaction>(basePathPlanned, payload),
  createBulkPlanned: (payload: CreateBulkPlannedTransactionsPayload) =>
    httpClient.post<PlannedTransaction[]>(basePathPlannedBulk, payload),
  update: (id: string, payload: UpdateTransactionPayload) =>
    httpClient.patch<ActualTransaction>(`${basePath}/${id}`, payload),
  delete: (id: string) =>
    httpClient.delete<{ deleted: boolean }>(`${basePath}/${id}`),
  getDashboard: (mode: "month" | "year", date: string, page = 1) =>
    httpClient.get<DashboardData>(
      `/api/dashboard?mode=${mode}&date=${date}&page=${page}`,
    ),
};
