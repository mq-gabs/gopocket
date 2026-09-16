"use client";

import { Suspense, useEffect, useState } from "react";
import {
  CheckIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Table, { TableColumn } from "@/components/tables/table";
import { RowActions } from "@/components/tables/row-actions";
import { AmountCell } from "@/components/amount-cell";
import { Button } from "@/components/button";
import { CategoryBadgesCell } from "@/components/tables/category-badges-cell";
import { ConfirmModal } from "@/components/confirm-modal";
import { Modal } from "@/components/modal";
import { TransactionFiltersBar } from "@/components/transaction-filters";
import { TransactionForm } from "@/components/transaction-form";
import { useI18n } from "@/contexts/i18n-context";
import { useCategories } from "@/contexts/category-context";
import { useRequest } from "@/hooks/use-request";
import { useTransactionFilters } from "@/hooks/use-transaction-filters";
import { transactionService } from "@/services/transaction.service";
import type {
  Category,
  CreatePlannedTransactionPayload,
  PlannedTransaction,
  UpdateTransactionPayload,
} from "@/types/models";
import { formatDate } from "@/utils/time";

export default function PlannedPage() {
  return (
    <Suspense fallback={null}>
      <PlannedPageContent />
    </Suspense>
  );
}

function PlannedPageContent() {
  const { t, locale } = useI18n();
  const { categories, categoryMap } = useCategories();
  const { state: filters, setState: setFilters, apiFilters } =
    useTransactionFilters();
  const [selectedPlanned, setSelectedPlanned] = useState<
    PlannedTransaction | undefined
  >();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    call: getAllPlanned,
    loading,
    result: plannedTransactions,
    error: plannedError,
  } = useRequest({
    callback: () => transactionService.getAllPlanned(apiFilters),
  });

  useEffect(() => {
    getAllPlanned();
  }, [apiFilters]);

  const openCreate = () => {
    setSelectedPlanned(undefined);
    setIsModalOpen(true);
  };

  const openEdit = (planned: PlannedTransaction) => {
    setSelectedPlanned(planned);
    setIsModalOpen(true);
  };

  const openDelete = (planned: PlannedTransaction) => {
    setSelectedPlanned(planned);
    setIsDeleteOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlanned(undefined);
  };

  const handleSubmit = async (
    payload: CreatePlannedTransactionPayload | UpdateTransactionPayload,
  ) => {
    try {
      if (selectedPlanned) {
        await transactionService.update(
          selectedPlanned.id,
          payload as UpdateTransactionPayload,
        );
      } else {
        await transactionService.createPlanned(
          payload as CreatePlannedTransactionPayload,
        );
      }
      setIsModalOpen(false);
      getAllPlanned();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    }
  };

  const handleDelete = async () => {
    if (!selectedPlanned) {
      return;
    }

    try {
      await transactionService.delete(selectedPlanned.id);
      setIsDeleteOpen(false);
      getAllPlanned();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    }
  };

  const handleMarkAsPaid = async (planned: PlannedTransaction) => {
    try {
      await transactionService.update(planned.id, {
        paid_at: new Date().toISOString(),
      });
      getAllPlanned();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    }
  };

  const columns: TableColumn<PlannedTransaction>[] = [
    {
      key: "title",
      header: t("transactions.table.title"),
      className: "font-medium text-foreground/80",
      render: (row) => row.title,
    },
    {
      key: "description",
      header: t("transactions.table.description"),
      className: "text-foreground/60",
      render: (row) => row.description || "—",
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
      key: "due_at",
      header: t("planned.table.dueAt"),
      className: "text-foreground/80",
      render: (row) => formatDate(row.due_at, locale),
    },
    {
      key: "actions",
      header: t("planned.table.actions"),
      render: (row) => (
        <RowActions
          actions={[
            ...(row.paid_at
              ? []
              : [
                  {
                    icon: CheckIcon,
                    label: t("actions.markAsPaid"),
                    variation: "primary" as const,
                    onClick: () => handleMarkAsPaid(row),
                  },
                ]),
            {
              icon: PencilIcon,
              label: t("actions.edit"),
              onClick: () => openEdit(row),
            },
            {
              icon: TrashIcon,
              label: t("actions.delete"),
              variation: "destructive" as const,
              onClick: () => openDelete(row),
            },
          ]}
        />
      ),
    },
  ];

  const requestError = error ?? plannedError;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-base-content">
            {t("planned.title")}
          </h1>
          <p className="mt-2 text-sm text-base-content/70">
            {t("planned.description")}
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="h-5 w-5" />
          {t("actions.newPlanned")}
        </Button>
      </div>

      <TransactionFiltersBar
        categories={categories}
        value={filters}
        onChange={setFilters}
      />

      {requestError ? (
        <div className="alert alert-error">{requestError}</div>
      ) : null}

      {loading ? <p>{t("common.loading")}</p> : null}

      {!loading ? (
        <Table
          columns={columns}
          data={plannedTransactions ?? []}
          size="sm"
          zebra
          getRowKey={(row) => row.id}
          emptyState={t("planned.empty")}
        />
      ) : null}

      <Modal
        title={
          selectedPlanned
            ? t("planned.form.title.edit")
            : t("planned.form.title.create")
        }
        open={isModalOpen}
        onClose={handleCloseModal}
      >
        <TransactionForm
          categories={categories}
          initialValues={selectedPlanned}
          submitLabel={t("actions.save")}
          includeDate={false}
          includeDueDate={!selectedPlanned}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>

      <ConfirmModal
        title={t("planned.delete.title")}
        message={t("planned.delete.message")}
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        confirmType="destructive"
      />
    </div>
  );
}
