import { httpClient } from "./http-client";
import type {
  CreateGoalPayload,
  Goal,
  PlannedTransaction,
  UpdateGoalPayload,
} from "@/types/models";

const basePath = "/api/goals";

export const goalService = {
  getAll: () => httpClient.get<Goal[]>(basePath),
  get: (id: string) => httpClient.get<Goal>(`${basePath}/${id}`),
  create: (payload: CreateGoalPayload) =>
    httpClient.post<Goal>(basePath, payload),
  update: (id: string, payload: UpdateGoalPayload) =>
    httpClient.patch<Goal>(`${basePath}/${id}`, payload),
  delete: (id: string) =>
    httpClient.delete<{ deleted: boolean }>(`${basePath}/${id}`),
  /**
   * Paid transactions first (latest payment first), then planned ones by due
   * date. Both kinds carry due_at; paid_at is null for the planned ones.
   */
  getTransactions: (id: string) =>
    httpClient.get<PlannedTransaction[]>(`${basePath}/${id}/transactions`),
  unlinkTransaction: (goalId: string, transactionId: string) =>
    httpClient.delete<{ unlinked: boolean }>(
      `${basePath}/${goalId}/transactions/${transactionId}`,
    ),
  linkTransactions: (goalIds: string[], transactionIds: string[]) =>
    httpClient.post<{ linked: boolean }>(`${basePath}/link-transactions`, {
      goal_ids: goalIds,
      transaction_ids: transactionIds,
    }),
};
