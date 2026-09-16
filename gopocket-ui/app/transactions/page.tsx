"use client";

import { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ConfirmModal } from "@/components/confirm-modal";
import { Modal } from "@/components/modal";
import { TransactionForm } from "@/components/transaction-form";
import { useI18n } from "@/contexts/i18n-context";
import { useCategories } from "@/contexts/category-context";
import { transactionService } from "@/services/transaction.service";
import type {
  CreateActualTransactionPayload,
  ActualTransaction,
  UpdateTransactionPayload,
} from "@/types/models";
import { Button } from "@/components/button";
import TransactionIcon from "@/components/transaction-icon";
import CategoryBadge from "@/components/category-badge";
import { formatDate } from "@/utils/time";
import Table, { TableColumn } from "@/components/tables/table";
import { RowActions } from "@/components/tables/row-actions";
import { AmountCell } from "@/components/amount-cell";
import { useRequest } from "@/hooks/use-request";

export default function TransactionsPage() {
  const { t, locale } = useI18n();
  const { categoryMap, categories } = useCategories();
  const [selectedTransaction, setSelectedTransaction] = useState<
    ActualTransaction | undefined
  >();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    call: getTransactions,
    result: transactions,
    loading,
    error: transactionsError,
  } = useRequest({
    callback: () => transactionService.getAllActual(),
  });

  useEffect(() => {
    getTransactions();
  }, []);

  const openCreate = () => {
    setSelectedTransaction(undefined);
    setIsModalOpen(true);
  };

  const openEdit = (transaction: ActualTransaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const openDelete = (transaction: ActualTransaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (
    payload: CreateActualTransactionPayload | UpdateTransactionPayload,
  ) => {
    try {
      if (selectedTransaction) {
        await transactionService.update(
          selectedTransaction.id,
          payload as UpdateTransactionPayload,
        );
      } else {
        await transactionService.createActual(
          payload as CreateActualTransactionPayload,
        );
      }
      setIsModalOpen(false);
      getTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    }
  };

  const handleDelete = async () => {
    if (!selectedTransaction) {
      return;
    }

    try {
      await transactionService.delete(selectedTransaction.id);
      setIsDeleteOpen(false);
      getTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(undefined);
  };

  const columns: TableColumn<ActualTransaction>[] = [
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
      render: (row) => row.description,
    },
    {
      key: "amount",
      header: t("transactions.table.amount"),
      render: (row) => <AmountCell amount={row.amount} type={row.type} />,
    },
    {
      key: "type",
      header: t("transactions.table.type"),
      render: (row) => <TransactionIcon type={row.type} />,
    },
    {
      key: "category",
      header: t("transactions.table.category"),
      render: (row) => {
        const category = categoryMap.get(row.category_id);
        return category ? (
          <CategoryBadge
            category={category}
            className="w-full block text-center"
          />
        ) : (
          <span className="text-foreground/60">—</span>
        );
      },
    },
    {
      key: "paid_at",
      header: t("transactions.table.date"),
      className: "text-foreground/80",
      render: (row) => formatDate(row.paid_at, locale),
    },
    {
      key: "actions",
      header: t("transactions.table.actions"),
      render: (row) => (
        <RowActions
          actions={[
            {
              icon: PencilIcon,
              label: t("actions.edit"),
              onClick: () => openEdit(row),
            },
            {
              icon: TrashIcon,
              label: t("actions.delete"),
              variation: "destructive",
              onClick: () => openDelete(row),
            },
          ]}
        />
      ),
    },
  ];

  const requestError = error ?? transactionsError;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-base-content">
            {t("transactions.title")}
          </h1>
          <p className="mt-2 text-sm text-base-content/70">
            {t("transactions.description")}
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="h-5 w-5" />
          {t("actions.newTransaction")}
        </Button>
      </div>

      {requestError ? (
        <div className="alert alert-error">{requestError}</div>
      ) : null}

      {loading ? <p>{t("common.loading")}</p> : null}

      {!loading ? (
        <Table
          columns={columns}
          data={transactions ?? []}
          size="sm"
          zebra
          getRowKey={(row) => row.id}
          emptyState={t("transactions.empty")}
        />
      ) : null}

      <Modal
        title={
          selectedTransaction
            ? t("transactions.form.title.edit")
            : t("transactions.form.title.create")
        }
        open={isModalOpen}
        onClose={handleCloseModal}
      >
        <TransactionForm
          categories={categories}
          initialValues={selectedTransaction}
          submitLabel={t("actions.save")}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>

      <ConfirmModal
        title={t("transactions.delete.title")}
        message={t("transactions.delete.message")}
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        confirmType="destructive"
      />
    </div>
  );
}
