"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { parseISO } from "date-fns";
import { MinusCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useI18n } from "@/contexts/i18n-context";
import { useCategories } from "@/contexts/category-context";
import { goalService } from "@/services/goal.service";
import type { Category, Goal, PlannedTransaction } from "@/types/models";
import { getErrorMessage } from "@/utils/api-error";
import { formatDate } from "@/utils/time";
import { AmountCell } from "./amount-cell";
import { Button } from "./button";
import { ConfirmModal } from "./confirm-modal";
import { GoalSummary } from "./goal-summary";
import { Skeleton } from "./skeleton";
import { CategoryBadgesCell } from "./tables/category-badges-cell";
import { RowActions } from "./tables/row-actions";
import Table, { TableColumn } from "./tables/table";

const TOGGLE_ID = "goal-drawer-toggle";

const fetchGoalDetails = (id: string) =>
  Promise.all([goalService.get(id), goalService.getTransactions(id)]);

interface GoalDrawerProps {
  open: boolean;
  /** Snapshot of the goal to show; refreshed by the drawer itself after changes. */
  goal: Goal | null;
  onClose: () => void;
  /** Called after the drawer changed the goal (e.g. unlinked a transaction), so the caller can refetch its list. */
  onChanged: () => void;
}

/**
 * Side drawer (daisyUI) with a goal's details and its linked transactions,
 * paid and planned ones in their own accordions (each shown only when it has
 * records).
 */
export function GoalDrawer({
  open,
  goal,
  onClose,
  onChanged,
}: GoalDrawerProps) {
  const { t } = useI18n();

  return (
    <div className="drawer drawer-end">
      <input
        id={TOGGLE_ID}
        type="checkbox"
        className="drawer-toggle"
        checked={open}
        onChange={(event) => {
          if (!event.target.checked) onClose();
        }}
        tabIndex={-1}
        aria-hidden="true"
      />
      <div className="drawer-side z-50">
        <label
          htmlFor={TOGGLE_ID}
          aria-label={t("goals.drawer.close")}
          className="drawer-overlay"
        />
        <aside className="h-full w-full max-w-2xl overflow-y-auto border-l border-foreground/10 bg-background p-6">
          {/* Keyed by goal so switching goals never flashes the previous one's transactions. */}
          {goal ? (
            <GoalDrawerContent
              key={goal.id}
              initialGoal={goal}
              open={open}
              onClose={onClose}
              onChanged={onChanged}
            />
          ) : null}
        </aside>
      </div>
    </div>
  );
}

interface GoalDrawerContentProps {
  initialGoal: Goal;
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
}

function GoalDrawerContent({
  initialGoal,
  open,
  onClose,
  onChanged,
}: GoalDrawerContentProps) {
  const { t, locale } = useI18n();
  const { categoryMap } = useCategories();
  const [goal, setGoal] = useState(initialGoal);
  const [transactions, setTransactions] = useState<PlannedTransaction[] | null>(
    null,
  );
  const [unlinkTarget, setUnlinkTarget] = useState<
    PlannedTransaction | undefined
  >();
  const [submitting, setSubmitting] = useState(false);

  // Fetch on mount. Later refetches (after a change) go through reload().
  useEffect(() => {
    let cancelled = false;

    fetchGoalDetails(initialGoal.id)
      .then(([freshGoal, freshTransactions]) => {
        if (cancelled) return;
        setGoal(freshGoal);
        setTransactions(freshTransactions);
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(getErrorMessage(err, t));
        setTransactions((current) => current ?? []);
      });

    return () => {
      cancelled = true;
    };
  }, [initialGoal.id, t]);

  // Refetches without clearing what is on screen, so the drawer doesn't
  // flash empty after every change.
  const reload = async () => {
    const [freshGoal, freshTransactions] = await fetchGoalDetails(goal.id);
    setGoal(freshGoal);
    setTransactions(freshTransactions);
  };

  // Escape closes the drawer, unless the unlink confirmation is on top.
  useEffect(() => {
    if (!open || unlinkTarget) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, unlinkTarget, onClose]);

  const handleUnlink = async () => {
    if (!unlinkTarget) return;

    setSubmitting(true);
    try {
      await goalService.unlinkTransaction(goal.id, unlinkTarget.id);
      toast.success(t("goals.toast.unlinked"));
      setUnlinkTarget(undefined);
      await reload();
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  };

  const paid = (transactions ?? []).filter((row) => row.paid_at);
  const planned = (transactions ?? []).filter((row) => !row.paid_at);

  const buildColumns = (
    dateHeader: string,
    getDate: (row: PlannedTransaction) => string,
  ): TableColumn<PlannedTransaction>[] => [
    {
      key: "title",
      header: t("transactions.table.title"),
      className: "font-medium text-foreground/80",
      render: (row) => row.title,
    },
    {
      key: "amount",
      header: t("transactions.table.amount"),
      render: (row) => <AmountCell amount={row.amount} type={row.type} />,
    },
    {
      key: "category",
      header: t("transactions.table.category"),
      render: (row) => {
        const rowCategories = row.category_ids
          .map((id) => categoryMap.get(id))
          .filter((category): category is Category => category !== undefined);
        return <CategoryBadgesCell categories={rowCategories} />;
      },
    },
    {
      key: "date",
      header: dateHeader,
      className: "whitespace-nowrap text-foreground/80",
      render: (row) => formatDate(getDate(row), locale),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <RowActions
          actions={[
            {
              icon: MinusCircleIcon,
              label: t("goals.drawer.unlink"),
              onClick: () => setUnlinkTarget(row),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="min-w-0 break-words text-2xl font-semibold">
          {goal.name}
        </h2>
        <Button
          onClick={onClose}
          className="p-1!"
          variation="blank"
          title={t("goals.drawer.close")}
          aria-label={t("goals.drawer.close")}
        >
          <XMarkIcon className="h-5 w-5" />
        </Button>
      </div>

      {goal.description ? (
        <p className="whitespace-pre-line break-words text-sm text-foreground/70">
          {goal.description}
        </p>
      ) : null}

      {goal.due_at ? (
        <p className="text-sm text-foreground/70">
          {t("goals.summary.dueOn")}{" "}
          <span className="font-medium text-foreground">
            {formatDate(parseISO(goal.due_at), locale)}
          </span>
        </p>
      ) : null}

      <GoalSummary goal={goal} />

      {transactions === null ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ) : transactions.length === 0 ? (
        <p className="rounded-xl border border-foreground/10 p-4 text-center text-sm text-foreground/60">
          {t("goals.drawer.noTransactions")}
        </p>
      ) : (
        <div className="space-y-3">
          {paid.length > 0 ? (
            <TransactionsAccordion
              title={`${t("goals.drawer.paidTransactions")} (${paid.length})`}
            >
              <Table
                columns={buildColumns(
                  t("transactions.table.date"),
                  (row) => row.paid_at,
                )}
                data={paid}
                size="xs"
                getRowKey={(row) => row.id}
              />
            </TransactionsAccordion>
          ) : null}

          {planned.length > 0 ? (
            <TransactionsAccordion
              title={`${t("goals.drawer.plannedTransactions")} (${planned.length})`}
            >
              <Table
                columns={buildColumns(
                  t("planned.table.dueAt"),
                  (row) => row.due_at,
                )}
                data={planned}
                size="xs"
                getRowKey={(row) => row.id}
              />
            </TransactionsAccordion>
          ) : null}
        </div>
      )}

      {/* Portaled out of the drawer: daisyUI keeps the panel translated, which
          makes it the containing block of `position: fixed` descendants and
          would clip the modal to the panel. */}
      {createPortal(
        <ConfirmModal
          title={t("goals.unlink.title")}
          message={t("goals.unlink.message")}
          open={unlinkTarget !== undefined}
          onClose={() => setUnlinkTarget(undefined)}
          onConfirm={handleUnlink}
          loading={submitting}
        />,
        document.body,
      )}
    </div>
  );
}

function TransactionsAccordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="collapse collapse-arrow rounded-xl border border-foreground/10 bg-foreground/5">
      <input type="checkbox" defaultChecked aria-label={title} />
      <div className="collapse-title text-sm font-semibold">{title}</div>
      <div className="collapse-content">{children}</div>
    </div>
  );
}
