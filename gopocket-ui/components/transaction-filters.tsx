"use client";

import { useEffect, useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Button } from "./button";
import { CategoryMultiSelect } from "./category-multi-select";
import { DatePicker } from "./inputs/date-picker";
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

  const activeFilterCount =
    (value.q ? 1 : 0) +
    value.categoryIds.length +
    (value.type ? 1 : 0) +
    (value.startDate ? 1 : 0) +
    (value.endDate || value.endNow ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  const [isOpen, setIsOpen] = useState(hasActiveFilters);

  const clearAll = () =>
    onChange({
      q: "",
      categoryIds: [],
      type: "",
      startDate: "",
      endDate: "",
      endNow: false,
    });

  return (
    <div className="rounded-2xl border border-foreground/10 bg-background p-4">
      <div className="flex items-center justify-between gap-4">
        <Button
          variation="blank"
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="flex cursor-pointer items-center gap-2 text-sm font-medium text-base-content"
        >
          <FunnelIcon className="h-4 w-4" />
          {t("filters.title")}
          {hasActiveFilters && (
            <span className="rounded-full bg-primary-20 px-2 py-0.5 text-xs font-bold text-primary">
              {activeFilterCount}
            </span>
          )}
          {isOpen ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </Button>

        {hasActiveFilters && (
          <Button type="button" variation="blank" onClick={clearAll}>
            <XMarkIcon className="h-4 w-4" />
            {t("filters.clear")}
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4">
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

            <DatePicker
              id="filter-start-date"
              label={t("filters.startDate")}
              value={value.startDate}
              onChange={(startDate) => onChange({ ...value, startDate })}
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
              <DatePicker
                id="filter-end-date"
                disabled={value.endNow}
                value={value.endDate}
                onChange={(endDate) => onChange({ ...value, endDate })}
              />
            </div>
          </div>

          <CategoryMultiSelect
            id="filter-category"
            label={t("filters.category")}
            categories={categories}
            selectedIds={value.categoryIds}
            onChange={(ids) => onChange({ ...value, categoryIds: ids })}
          />
        </div>
      )}
    </div>
  );
}
