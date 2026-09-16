"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { TransactionListFilters } from "@/types/models";
import { TransactionType } from "@/types/transaction-type";

export interface TransactionFiltersState {
  q: string;
  categoryIds: string[];
  type: TransactionType | "";
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD, ignored when endNow is true */
  endDate: string;
  endNow: boolean;
}

const emptyState: TransactionFiltersState = {
  q: "",
  categoryIds: [],
  type: "",
  startDate: "",
  endDate: "",
  endNow: false,
};

function parseState(params: URLSearchParams): TransactionFiltersState {
  return {
    q: params.get("q") ?? "",
    categoryIds: params
      .getAll("category_ids")
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean),
    type: (params.get("type") as TransactionType | null) ?? "",
    startDate: params.get("start_date") ?? "",
    endDate: params.get("end_date") ?? "",
    endNow: params.get("end_now") === "1",
  };
}

function toSearchParams(state: TransactionFiltersState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  state.categoryIds.forEach((id) => params.append("category_ids", id));
  if (state.type) params.set("type", state.type);
  if (state.startDate) params.set("start_date", state.startDate);
  if (state.endNow) {
    params.set("end_now", "1");
  } else if (state.endDate) {
    params.set("end_date", state.endDate);
  }
  return params;
}

/**
 * Reads/writes transaction filters to the URL query string, and derives the
 * API-ready filter payload (RFC3339 dates, "now" sentinel) from it.
 */
export function useTransactionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(() => parseState(searchParams), [searchParams]);

  const setState = useCallback(
    (next: TransactionFiltersState) => {
      const query = toSearchParams(next).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname],
  );

  const clear = useCallback(() => setState(emptyState), [setState]);

  const apiFilters = useMemo<TransactionListFilters>(() => {
    const filters: TransactionListFilters = {};

    if (state.q) filters.q = state.q;
    if (state.categoryIds.length > 0) filters.category_ids = state.categoryIds;
    if (state.type) filters.type = state.type;
    if (state.startDate) {
      filters.start_date = new Date(
        `${state.startDate}T00:00:00`,
      ).toISOString();
    }
    if (state.endNow) {
      filters.end_date = "now";
    } else if (state.endDate) {
      filters.end_date = new Date(`${state.endDate}T23:59:59`).toISOString();
    }

    return filters;
  }, [state]);

  return { state, setState, clear, apiFilters };
}
