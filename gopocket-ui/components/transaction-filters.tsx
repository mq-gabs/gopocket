"use client";

import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "./button";
import { CategoryMultiSelect } from "./category-multi-select";
import { InputLabel } from "./inputs/input-label";
import { SelectLabel } from "./select/select-label";
import { useI18n } from "@/contexts/i18n-context";
import { TransactionType } from "@/types/transaction-type";
import type { Category } from "@/types/models";
import type { TransactionFiltersState } from "@/hooks/use-transaction-filters";

interface TransactionFiltersBarProps {
  categories: Category[];
  value: TransactionFiltersState;
  onChange: (value: TransactionFiltersState) => void;
}

const SEARCH_DEBOUNCE_MS = 400;

export function TransactionFiltersBar({
  categories,
  value,
  onChange,
}: TransactionFiltersBarProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState(value.q);
  const [syncedQuery, setSyncedQuery] = useState(value.q);

  if (value.q !== syncedQuery) {
    setSyncedQuery(value.q);
    setSearch(value.q);
  }

  useEffect(() => {
    if (search === value.q) return;
    const handle = setTimeout(() => {
      onChange({ ...value, q: search });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
    // Only re-run when the debounced text itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const typeOptions = [
    { value: "", label: t("filters.type.all") },
    {
      value: TransactionType.EXPENSE,
      label: t("categories.form.type.expense"),
    },
    { value: TransactionType.INCOME, label: t("categories.form.type.income") },
  ];

  const hasActiveFilters =
    Boolean(value.q) ||
    value.categoryIds.length > 0 ||
    Boolean(value.type) ||
    Boolean(value.startDate) ||
    Boolean(value.endDate) ||
    value.endNow;

  return (
    <div className="space-y-4 rounded-2xl border border-foreground/10 bg-background p-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InputLabel
          id="filter-search"
          label={t("filters.search")}
          placeholder={t("filters.searchPlaceholder")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <SelectLabel
          id="filter-type"
          label={t("filters.type")}
          value={value.type}
          onChange={(event) =>
            onChange({
              ...value,
              type: event.target.value as TransactionType | "",
            })
          }
          options={typeOptions}
        />

        <InputLabel
          id="filter-start-date"
          label={t("filters.startDate")}
          type="date"
          value={value.startDate}
          onChange={(event) =>
            onChange({ ...value, startDate: event.target.value })
          }
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="filter-end-date"
              className="text-sm font-medium text-base-content"
            >
              {t("filters.endDate")}
            </label>
            <label className="flex items-center gap-1 text-xs text-foreground/70">
              <input
                type="checkbox"
                checked={value.endNow}
                onChange={(event) =>
                  onChange({ ...value, endNow: event.target.checked })
                }
              />
              {t("filters.now")}
            </label>
          </div>
          <input
            id="filter-end-date"
            type="date"
            disabled={value.endNow}
            value={value.endDate}
            onChange={(event) =>
              onChange({ ...value, endDate: event.target.value })
            }
            className="text-sm border border-light-gray outline-primary px-3 py-1 rounded-lg w-full disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex items-end gap-4">
        <div className="flex-1">
          <CategoryMultiSelect
            id="filter-category"
            label={t("filters.category")}
            categories={categories}
            selectedIds={value.categoryIds}
            onChange={(ids) => onChange({ ...value, categoryIds: ids })}
          />
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variation="blank"
            onClick={() =>
              onChange({
                q: "",
                categoryIds: [],
                type: "",
                startDate: "",
                endDate: "",
                endNow: false,
              })
            }
          >
            <XMarkIcon className="h-4 w-4" />
            {t("filters.clear")}
          </Button>
        )}
      </div>
    </div>
  );
}
