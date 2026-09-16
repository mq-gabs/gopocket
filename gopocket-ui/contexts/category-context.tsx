"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { useRequest } from "@/hooks/use-request";
import { categoryService } from "@/services/category.service";
import type { Category } from "@/types/models";

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
  const { call, result, loading, error } = useRequest({
    callback: () => categoryService.getAll(),
  });

  useEffect(() => {
    call();
  }, []);

  const categories = useMemo(() => result ?? [], [result]);

  const value = useMemo<CategoryContextValue>(
    () => ({
      categories,
      categoryMap: new Map(
        categories.map((category) => [category.id, category]),
      ),
      loading,
      error,
      refetch: call,
    }),
    [categories, loading, error],
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
