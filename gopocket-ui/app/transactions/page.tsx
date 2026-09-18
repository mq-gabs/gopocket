"use client";

import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  PlusIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  TagIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { BulkSetCategoriesForm } from "@/components/bulk-set-categories-form";
import { ConfirmModal } from "@/components/confirm-modal";
import { ImportNubankForm } from "@/components/import-nubank-form";
import { Modal } from "@/components/modal";
import { TransactionFiltersBar } from "@/components/transaction-filters";
import { TransactionForm } from "@/components/transaction-form";
import { useI18n } from "@/contexts/i18n-context";
import { useCategories } from "@/contexts/category-context";
import { transactionService } from "@/services/transaction.service";
import type {
  Category,
  CreateActualTransactionPayload,
  ActualTransaction,
  ImportRule,
  UpdateTransactionPayload,
} from "@/types/models";
import { Button } from "@/components/button";
import { CategoryBadgesCell } from "@/components/tables/category-badges-cell";
import { formatDate } from "@/utils/time";
import Table, { TableColumn } from "@/components/tables/table";
import { HoverRowActions } from "@/components/tables/row-actions";
import { AmountCell } from "@/components/amount-cell";
import { RefreshButton } from "@/components/refresh-button";
import { useRequest } from "@/hooks/use-request";
import { useTransactionFilters } from "@/hooks/use-transaction-filters";
import { getErrorMessage, translateErrorKey } from "@/utils/api-error";

export default function TransactionsPage() {
  return (
    <Suspense fallback={null}>
      <TransactionsPageContent />
    </Suspense>
  );
}

function TransactionsPageContent() {
  const { t, locale } = useI18n();
  const { categoryMap, categories } = useCategories();
  const {
    state: filters,
    setState: setFilters,
    apiFilters,
  } = useTransactionFilters();
  const [selectedTransaction, setSelectedTransaction] = useState<
    ActualTransaction | undefined
  >();
  const [copySource, setCopySource] = useState<ActualTransaction | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkSetCategoriesOpen, setIsBulkSetCategoriesOpen] =
    useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(
    new Set(),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    call: getTransactions,
    result: transactions,
    loading,
    error: transactionsError,
    errorKey: transactionsErrorKey,
  } = useRequest({
    callback: () => transactionService.getAllActual(apiFilters),
  });

  useEffect(() => {
    getTransactions();
  }, [apiFilters]);

  // Only rows still present in the current (possibly filtered) result set
  // count as selected, so a stale selection can never leak into a bulk
  // action after the filters change.
  const selectedIds = (transactions ?? [])
    .map((transaction) => transaction.id)
    .filter((id) => selectedKeys.has(id));

  const openCreate = () => {
    setSelectedTransaction(undefined);
    setCopySource(undefined);
    setIsModalOpen(true);
  };

  const openImport = () => setIsImportModalOpen(true);

  const openEdit = (transaction: ActualTransaction) => {
    setSelectedTransaction(transaction);
    setCopySource(undefined);
    setIsModalOpen(true);
  };

  const openCopy = (transaction: ActualTransaction) => {
    setSelectedTransaction(undefined);
    setCopySource(transaction);
    setIsModalOpen(true);
  };

  const openDelete = (transaction: ActualTransaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (
    payload: CreateActualTransactionPayload | UpdateTransactionPayload,
  ) => {
    setSubmitting(true);
    try {
      if (selectedTransaction) {
        await transactionService.update(
          selectedTransaction.id,
          payload as UpdateTransactionPayload,
        );
        toast.success(t("transactions.toast.updated"));
      } else {
        await transactionService.createActual(
          payload as CreateActualTransactionPayload,
        );
        toast.success(t("transactions.toast.created"));
      }
      setIsModalOpen(false);
      getTransactions();
    } catch (err) {
      const message = getErrorMessage(err, t);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTransaction) {
      return;
    }

    setSubmitting(true);
    try {
      await transactionService.delete(selectedTransaction.id);
      toast.success(t("transactions.toast.deleted"));
      setIsDeleteOpen(false);
      getTransactions();
    } catch (err) {
      const message = getErrorMessage(err, t);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(undefined);
    setCopySource(undefined);
  };

  const handleImportSubmit = async (
    file: File,
    generalCategoryIds: string[],
    rules: ImportRule[],
  ) => {
    try {
      await transactionService.importNubank(file, {
        general_category_ids: generalCategoryIds,
        rules,
      });
      setIsImportModalOpen(false);
    } catch (err) {
      const message = getErrorMessage(err, t);
      toast.error(message);
    }
  };

  const handleBulkDelete = async () => {
    setSubmitting(true);
    try {
      await transactionService.deleteBulk(selectedIds);
      toast.success(t("transactions.toast.bulkDeleted"));
      setIsBulkDeleteOpen(false);
      setSelectedKeys(new Set());
      getTransactions();
    } catch (err) {
      const message = getErrorMessage(err, t);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkSetCategories = async (categoryIds: string[]) => {
    setSubmitting(true);
    try {
      await transactionService.setCategoriesBulk(selectedIds, categoryIds);
      toast.success(t("bulkActions.setCategories.toast"));
      setIsBulkSetCategoriesOpen(false);
      setSelectedKeys(new Set());
      getTransactions();
    } catch (err) {
      const message = getErrorMessage(err, t);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
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
      key: "paid_at",
      header: t("transactions.table.date"),
      className: "text-foreground/80",
      render: (row) => formatDate(row.paid_at, locale),
    },
    {
      key: "actions",
      header: "",
      render: (row, _rowIndex, isRowHovered) => (
        <HoverRowActions
          isRowHovered={isRowHovered}
          actions={[
            {
              icon: PencilIcon,
              label: t("actions.edit"),
              onClick: () => openEdit(row),
            },
            {
              icon: DocumentDuplicateIcon,
              label: t("actions.copy"),
              onClick: () => openCopy(row),
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

  const requestError =
    error ?? (transactionsError ? translateErrorKey(transactionsErrorKey, t) : null);

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
        <div className="flex items-center gap-2">
          <RefreshButton onClick={getTransactions} loading={loading} />
          <Button
            onClick={openCreate}
            actionsLabel={t("actions.more")}
            actions={[
              {
                label: t("transactions.import.nubank.action"),
                onClick: openImport,
              },
            ]}
          >
            <PlusIcon className="h-5 w-5" />
            {t("actions.newTransaction")}
          </Button>
        </div>
      </div>

      <TransactionFiltersBar
        categories={categories}
        value={filters}
        onChange={setFilters}
      />

      {requestError ? (
        <div className="alert alert-error">{requestError}</div>
      ) : null}

      <Table
        columns={columns}
        data={transactions ?? []}
        size="sm"
        getRowKey={(row) => row.id}
        emptyState={t("transactions.empty")}
        selectable
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        loading={loading}
        bulkActions={[
          {
            icon: TagIcon,
            label: t("bulkActions.setCategories"),
            onClick: () => setIsBulkSetCategoriesOpen(true),
          },
          {
            icon: TrashIcon,
            label: t("bulkActions.deleteAll"),
            variation: "destructive",
            onClick: () => setIsBulkDeleteOpen(true),
          },
        ]}
      />

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
          initialValues={selectedTransaction ?? copySource}
          isEditing={Boolean(selectedTransaction)}
          submitLabel={t("actions.save")}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={submitting}
        />
      </Modal>

      <Modal
        title={t("transactions.import.nubank.title")}
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      >
        <ImportNubankForm
          categories={categories}
          submitLabel={t("actions.startImport")}
          onSubmit={handleImportSubmit}
          onCancel={() => setIsImportModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        title={t("transactions.delete.title")}
        message={t("transactions.delete.message")}
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        confirmType="destructive"
        loading={submitting}
      />

      <ConfirmModal
        title={t("bulkActions.deleteTransactions.title")}
        message={t("bulkActions.deleteTransactions.message")}
        open={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        confirmType="destructive"
        loading={submitting}
      />

      <Modal
        title={t("bulkActions.setCategories.title")}
        open={isBulkSetCategoriesOpen}
        onClose={() => setIsBulkSetCategoriesOpen(false)}
      >
        <BulkSetCategoriesForm
          count={selectedIds.length}
          categories={categories}
          submitLabel={t("actions.save")}
          onSubmit={handleBulkSetCategories}
          onCancel={() => setIsBulkSetCategoriesOpen(false)}
          loading={submitting}
        />
      </Modal>
    </div>
  );
}
