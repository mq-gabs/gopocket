"use client";

import Table, { TableColumn, TableProps } from "@/components/tables/table";
import TransactionIcon from "@/components/transaction-icon";
import { useI18n } from "@/contexts/i18n-context";
import { useRequest } from "@/hooks/use-request";
import { Locale } from "@/locales";
import { transactionService } from "@/services/transaction.service";
import { ActualTransaction, PlannedTransaction } from "@/types/models";
import { TransactionType } from "@/types/transaction-type";
import { formatCurrencyString } from "@/utils/currency";
import { formatDate } from "@/utils/time";
import { useEffect } from "react";

/**
 * Builds the default column set for an ActualTransaction table.
 * Shows: title, description, amount, category name, due at.
 * Pass `overrides` to replace/extend specific columns without
 * rewriting the whole set from scratch.
 */
export function buildTransactionColumns({
  overrides,
  locale,
}: {
  overrides?: Partial<
    Record<keyof ActualTransaction, Partial<TableColumn<PlannedTransaction>>>
  >;
  locale: Locale;
}): TableColumn<PlannedTransaction>[] {
  const base: TableColumn<PlannedTransaction>[] = [
    {
      key: "title",
      header: "Title",
      render: (row) => <span className="font-medium">{row.title}</span>,
    },
    {
      key: "description",
      header: "Description",
      render: (row) => (
        <span className="text-sm text-base-content/70">
          {row.description || "—"}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => <TransactionIcon type={row.type} />,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (row) => (
        <span
          className={`font-medium ${
            row.type === TransactionType.EXPENSE ? "text-error" : "text-success"
          }`}
        >
          {row.type === TransactionType.EXPENSE ? "-" : "+"}
          {formatCurrencyString(row.amount)}
        </span>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (row) =>
        row.category ? (
          <span
            className="badge badge-outline gap-1"
            style={{
              borderColor: row.category.color,
              color: row.category.color,
            }}
          >
            {row.category.icon && <span>{row.category.icon}</span>}
            {row.category.name}
          </span>
        ) : (
          <span className="text-base-content/40">Uncategorized</span>
        ),
    },
    {
      key: "due_at",
      header: "Due At",
      align: "right",
      render: (row) => formatDate(row.due_at, locale),
    },
  ];

  if (!overrides) return base;

  return base.map((col) => {
    const override = overrides[col.key as keyof ActualTransaction];
    return override ? { ...col, ...override } : col;
  });
}

/**
 * Builds full default TableProps for ActualTransaction, ready to spread
 * into <Table {...props} />. Pass `data` and any prop overrides.
 */
export function buildTransactionTableProps(
  data: PlannedTransaction[],
  locale: Locale,
  overrides?: Partial<TableProps<PlannedTransaction>>,
): TableProps<PlannedTransaction> {
  return {
    columns: buildTransactionColumns({ locale }),
    data,
    size: "sm",
    zebra: true,
    getRowKey: (row) => row.id,
    emptyState: "No transactions found",
    ...overrides,
  };
}

export default function ProjectionPage() {
  const { locale } = useI18n();
  const {
    call: getAllPlanned,
    loading,
    result,
  } = useRequest({
    callback: () => transactionService.getAllPlanned(),
  });
  console.log({ result });

  useEffect(() => {
    getAllPlanned();
  }, []);

  return (
    <div>
      {loading && <h1>LOADING</h1>}

      {result && result.length > 0 && (
        <Table {...buildTransactionTableProps(result, locale)} />
      )}
    </div>
  );
}
