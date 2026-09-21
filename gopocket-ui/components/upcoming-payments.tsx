"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  ChevronDoubleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { AmountCell } from "@/components/amount-cell";
import { Button } from "@/components/button";
import Table, { TableColumn } from "@/components/tables/table";
import { TranslateFunction, useI18n } from "@/contexts/i18n-context";
import type { Locale } from "@/locales";
import type { PlannedTransaction } from "@/types/models";
import { cls } from "@/utils/cls";
import { daysLabel } from "@/utils/days-label";
import { daysUntil, paginate, UPCOMING_PAGE_SIZE } from "@/utils/home";
import { formatDate } from "@/utils/time";

/** Payments due within this many days get highlighted as urgent. */
const URGENT_DAYS = 3;

interface UpcomingPaymentsProps {
  /** Sorted from the soonest due date (overdue first) to the latest. */
  payments: PlannedTransaction[];
  now: Date;
  loading: boolean;
}

/**
 * The planned payments ordered by how soon they are due, ten at a time. The
 * page is local state, so paging here never touches the rest of the home page.
 */
export function UpcomingPayments({
  payments,
  now,
  loading,
}: UpcomingPaymentsProps) {
  const { t, locale } = useI18n();
  const [requestedPage, setRequestedPage] = useState(1);

  // Derived (and clamped) rather than stored, so a refresh that leaves fewer
  // payments can't strand the list on a page that no longer exists.
  const { items, page, totalPages, from, to, total } = paginate(
    payments,
    requestedPage,
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5">
      <div className="flex flex-col gap-3 border-b border-foreground/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t("home.upcoming.title")}</h2>
          <p className="text-sm text-base-content/60">
            {t("home.upcoming.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Button variation="primary" onClick={() => setRequestedPage(1)}>
              <ChevronDoubleLeftIcon className="h-4 w-4" />
              {t("home.upcoming.seeMostUrgent")}
            </Button>
          ) : null}
          <Link href="/planned">
            <Button variation="neutral">
              {t("home.viewPlanned")} <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <Table
        columns={buildColumns(t, locale, now)}
        data={items}
        size="sm"
        getRowKey={(row) => row.id}
        emptyState={t("home.upcoming.empty")}
        loading={loading}
        skeletonRowCount={UPCOMING_PAGE_SIZE}
      />

      {!loading && total > UPCOMING_PAGE_SIZE ? (
        <div className="flex items-center justify-between gap-3 border-t border-foreground/10 px-5 py-3">
          <p className="text-sm text-base-content/60">
            {from}–{to} {t("home.upcoming.of")} {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variation="neutral"
              disabled={page <= 1}
              onClick={() => setRequestedPage(page - 1)}
            >
              <ChevronLeftIcon className="h-4 w-4" />
              {t("home.upcoming.previous")}
            </Button>
            <Button
              variation="neutral"
              disabled={page >= totalPages}
              onClick={() => setRequestedPage(page + 1)}
            >
              {t("home.upcoming.next")}
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function buildColumns(
  t: TranslateFunction,
  locale: Locale,
  now: Date,
): TableColumn<PlannedTransaction>[] {
  return [
    {
      key: "title",
      header: t("transactions.table.title"),
      className: "font-medium",
      render: (row) => row.title,
    },
    {
      key: "due_at",
      header: t("planned.table.dueAt"),
      className: "text-base-content/65",
      render: (row) => formatDate(row.due_at, locale),
    },
    {
      key: "days_left",
      header: t("home.upcoming.timeLeft"),
      render: (row) => {
        const days = daysUntil(row.due_at, now);
        return (
          <span
            className={cls(
              "whitespace-nowrap rounded-lg px-2 py-0.5 text-xs font-semibold",
              days < 0
                ? "bg-destructive/20 text-destructive"
                : days <= URGENT_DAYS
                  ? "bg-secondary-20 text-secondary"
                  : "bg-foreground/10 text-foreground/70",
            )}
          >
            {daysLabel(days, t)}
          </span>
        );
      },
    },
    {
      key: "amount",
      header: t("transactions.table.amount"),
      render: (row) => <AmountCell amount={row.amount} type={row.type} />,
    },
  ];
}
