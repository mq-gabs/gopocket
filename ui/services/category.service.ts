import { httpClient } from "./http-client";
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from "@/types/models";

const basePath = "/api/categories";

export const categoryService = {
  getAll: () => httpClient.get<Category[]>(basePath),
  get: (id: string) => httpClient.get<Category>(`${basePath}/${id}`),
  create: (payload: CreateCategoryPayload) => httpClient.post<Category>(basePath, payload),
  update: (id: string, payload: UpdateCategoryPayload) => httpClient.patch<Category>(`${basePath}/${id}`, payload),
  delete: (id: string) => httpClient.delete<{ deleted: boolean }>(`${basePath}/${id}`),
};
