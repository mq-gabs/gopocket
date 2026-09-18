"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { useI18n } from "./i18n-context";
import { useRequest } from "@/hooks/use-request";
import { categoryService } from "@/services/category.service";
import type { Category } from "@/types/models";
import { translateErrorKey } from "@/utils/api-error";

interface CategoryContextValue {
  categories: Category[];
  categoryMap: Map<string, Category>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const CategoryContext = createContext<CategoryContextValue | undefined>(
  undefined,
);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const { call, result, loading, error, errorKey } = useRequest({
    callback: () => categoryService.getAll(),
  });

  useEffect(() => {
    call();
  }, []);

  const categories = useMemo(() => result ?? [], [result]);
  const translatedError = error ? translateErrorKey(errorKey, t) : null;

  const value = useMemo<CategoryContextValue>(
    () => ({
      categories,
      categoryMap: new Map(
        categories.map((category) => [category.id, category]),
      ),
      loading,
      error: translatedError,
      refetch: call,
    }),
    [categories, loading, translatedError],
  );

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategories must be used within CategoryProvider");
  }
  return context;
}
