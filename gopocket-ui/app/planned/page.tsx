"use client";

import { useEffect } from "react";
import Table, { TableColumn } from "@/components/tables/table";
import TransactionIcon from "@/components/transaction-icon";
import { TranslateFunction, useI18n } from "@/contexts/i18n-context";
import { useRequest } from "@/hooks/use-request";
import { Locale } from "@/locales";
import { transactionService } from "@/services/transaction.service";
import { PlannedTransaction } from "@/types/models";
import { TransactionType } from "@/types/transaction-type";
import { formatCurrencyString } from "@/utils/currency";
import { formatDate } from "@/utils/time";

function buildPlannedColumns(
  t: TranslateFunction,
  locale: Locale,
): TableColumn<PlannedTransaction>[] {
  return [
    {
      key: "title",
      header: t("transactions.table.title"),
      render: (row) => <span className="font-medium">{row.title}</span>,
    },
    {
      key: "description",
      header: t("transactions.table.description"),
      render: (row) => (
        <span className="text-sm text-base-content/70">
          {row.description || "—"}
        </span>
      ),
    },
    {
      key: "type",
      header: t("transactions.table.type"),
      render: (row) => <TransactionIcon type={row.type} />,
    },
    {
      key: "amount",
      header: t("transactions.table.amount"),
      align: "right",
      render: (row) => (
        <span
          className={`font-medium ${
            row.type === TransactionType.EXPENSE
              ? "text-error"
              : "text-success"
          }`}
        >
          {row.type === TransactionType.EXPENSE ? "-" : "+"}
          {formatCurrencyString(row.amount)}
        </span>
      ),
    },
    {
      key: "category",
      header: t("transactions.table.category"),
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
          <span className="text-base-content/40">
            {t("transactions.table.uncategorized")}
          </span>
        ),
    },
    {
      key: "due_at",
      header: t("planned.table.dueAt"),
      align: "right",
      render: (row) => formatDate(row.due_at, locale),
    },
  ];
}

export default function PlannedPage() {
  const { t, locale } = useI18n();
  const {
    call: getAllPlanned,
    loading,
    result: plannedTransactions,
  } = useRequest({
    callback: () => transactionService.getAllPlanned(),
  });

  useEffect(() => {
    getAllPlanned();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-base-content">
          {t("planned.title")}
        </h1>
        <p className="mt-2 text-sm text-base-content/70">
          {t("planned.description")}
        </p>
      </div>

      {loading ? <p>{t("common.loading")}</p> : null}

      {!loading ? (
        <Table
          columns={buildPlannedColumns(t, locale)}
          data={plannedTransactions ?? []}
          size="sm"
          zebra
          getRowKey={(row) => row.id}
          emptyState={t("planned.empty")}
        />
      ) : null}
    </div>
  );
}
