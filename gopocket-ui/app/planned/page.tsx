"use client";

import { useEffect, useState } from "react";
import { CheckIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Table, { TableColumn } from "@/components/tables/table";
import { RowActions } from "@/components/tables/row-actions";
import { AmountCell } from "@/components/amount-cell";
import { CategoryBadgesCell } from "@/components/tables/category-badges-cell";
import { ConfirmModal } from "@/components/confirm-modal";
import { Modal } from "@/components/modal";
import { TransactionForm } from "@/components/transaction-form";
import { useI18n } from "@/contexts/i18n-context";
import { useCategories } from "@/contexts/category-context";
import { useRequest } from "@/hooks/use-request";
import { transactionService } from "@/services/transaction.service";
import type {
  Category,
  PlannedTransaction,
  UpdateTransactionPayload,
} from "@/types/models";
import { formatDate } from "@/utils/time";

export default function PlannedPage() {
  const { t, locale } = useI18n();
  const { categories, categoryMap } = useCategories();
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
    callback: () => transactionService.getAllPlanned(),
  });

  useEffect(() => {
    getAllPlanned();
  }, []);

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

  const handleSubmit = async (payload: UpdateTransactionPayload) => {
    if (!selectedPlanned) {
      return;
    }

    try {
      await transactionService.update(selectedPlanned.id, payload);
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
      <div>
        <h1 className="text-3xl font-semibold text-base-content">
          {t("planned.title")}
        </h1>
        <p className="mt-2 text-sm text-base-content/70">
          {t("planned.description")}
        </p>
      </div>

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
        title={t("planned.form.title.edit")}
        open={isModalOpen}
        onClose={handleCloseModal}
      >
        <TransactionForm
          categories={categories}
          initialValues={selectedPlanned}
          submitLabel={t("actions.save")}
          includeDate={false}
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
