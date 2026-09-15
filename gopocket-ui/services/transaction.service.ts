import { httpClient } from "./http-client";
import type {
  DashboardData,
  ActualTransaction,
  CreateActualTransactionPayload,
  UpdateTransactionPayload,
} from "@/types/models";

const join = (...paths: string[]): string => paths.join("/");

const basePath = "/api/transactions";

const basePathActual = join(basePath, "actual");

export const transactionService = {
  getAllActual: () => httpClient.get<ActualTransaction[]>(basePathActual),
  get: (id: string) => httpClient.get<ActualTransaction>(`${basePath}/${id}`),
  createActual: (payload: CreateActualTransactionPayload) =>
    httpClient.post<ActualTransaction>(basePathActual, payload),
  update: (id: string, payload: UpdateTransactionPayload) =>
    httpClient.patch<ActualTransaction>(`${basePath}/${id}`, payload),
  delete: (id: string) =>
    httpClient.delete<{ deleted: boolean }>(`${basePath}/${id}`),
  getDashboard: (mode: "month" | "year", date: string, page = 1) =>
    httpClient.get<DashboardData>(
      `/api/dashboard?mode=${mode}&date=${date}&page=${page}`,
    ),
};
