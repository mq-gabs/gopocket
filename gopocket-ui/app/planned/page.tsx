"use client";

import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CheckIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Table, { TableColumn } from "@/components/tables/table";
import { HoverRowActions } from "@/components/tables/row-actions";
import { AmountCell } from "@/components/amount-cell";
import { BulkPlannedForm } from "@/components/bulk-planned-form";
import { BulkSetCategoriesForm } from "@/components/bulk-set-categories-form";
import { Button } from "@/components/button";
import { CategoryBadgesCell } from "@/components/tables/category-badges-cell";
import { ConfirmModal } from "@/components/confirm-modal";
import { Modal } from "@/components/modal";
import { RefreshButton } from "@/components/refresh-button";
import { TransactionFiltersBar } from "@/components/transaction-filters";
import { TransactionForm } from "@/components/transaction-form";
import { useI18n } from "@/contexts/i18n-context";
import { useCategories } from "@/contexts/category-context";
import { useRequest } from "@/hooks/use-request";
import { useTransactionFilters } from "@/hooks/use-transaction-filters";
import { transactionService } from "@/services/transaction.service";
import type {
  Category,
  CreateBulkPlannedTransactionsPayload,
  CreatePlannedTransactionPayload,
  PlannedTransaction,
  UpdateTransactionPayload,
} from "@/types/models";
import { formatDate } from "@/utils/time";
import { getErrorMessage, translateErrorKey } from "@/utils/api-error";

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
  const {
    state: filters,
    setState: setFilters,
    apiFilters,
  } = useTransactionFilters();
  const [selectedPlanned, setSelectedPlanned] = useState<
    PlannedTransaction | undefined
  >();
  const [copySource, setCopySource] = useState<
    PlannedTransaction | undefined
  >();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
  const [isBulkMarkPaidOpen, setIsBulkMarkPaidOpen] = useState(false);
  const [isBulkSetCategoriesOpen, setIsBulkSetCategoriesOpen] =
    useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(
    new Set(),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    call: getAllPlanned,
    loading,
    result: plannedTransactions,
    error: plannedError,
    errorKey: plannedErrorKey,
  } = useRequest({
    callback: () => transactionService.getAllPlanned(apiFilters),
  });

  useEffect(() => {
    getAllPlanned();
  }, [apiFilters]);

  // Only rows still present in the current (possibly filtered) result set
  // count as selected, so a stale selection can never leak into a bulk
  // action after the filters change.
  const selectedIds = (plannedTransactions ?? [])
    .map((planned) => planned.id)
    .filter((id) => selectedKeys.has(id));

  const openCreate = () => {
    setSelectedPlanned(undefined);
    setCopySource(undefined);
    setIsModalOpen(true);
  };

  const openEdit = (planned: PlannedTransaction) => {
    setSelectedPlanned(planned);
    setCopySource(undefined);
    setIsModalOpen(true);
  };

  const openCopy = (planned: PlannedTransaction) => {
    setSelectedPlanned(undefined);
    setCopySource(planned);
    setIsModalOpen(true);
  };

  const openDelete = (planned: PlannedTransaction) => {
    setSelectedPlanned(planned);
    setIsDeleteOpen(true);
  };

  const openMarkAsPaid = (planned: PlannedTransaction) => {
    setSelectedPlanned(planned);
    setIsMarkPaidOpen(true);
  };

  const openBulkCreate = () => {
    setIsBulkModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlanned(undefined);
    setCopySource(undefined);
  };

  const handleCloseBulkModal = () => {
    setIsBulkModalOpen(false);
  };

  const handleSubmit = async (
    payload: CreatePlannedTransactionPayload | UpdateTransactionPayload,
  ) => {
    setSubmitting(true);
    try {
      if (selectedPlanned) {
        await transactionService.update(
          selectedPlanned.id,
          payload as UpdateTransactionPayload,
        );
        toast.success(t("planned.toast.updated"));
      } else {
        await transactionService.createPlanned(
          payload as CreatePlannedTransactionPayload,
        );
        toast.success(t("planned.toast.created"));
      }
      setIsModalOpen(false);
      getAllPlanned();
    } catch (err) {
      const message = getErrorMessage(err, t);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkSubmit = async (
    payload: CreateBulkPlannedTransactionsPayload,
  ) => {
    setSubmitting(true);
    try {
      await transactionService.createBulkPlanned(payload);
      toast.success(t("planned.toast.bulkCreated"));
      setIsBulkModalOpen(false);
      getAllPlanned();
    } catch (err) {
      const message = getErrorMessage(err, t);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPlanned) {
      return;
    }

    setSubmitting(true);
    try {
      await transactionService.delete(selectedPlanned.id);
      toast.success(t("planned.toast.deleted"));
      setIsDeleteOpen(false);
      getAllPlanned();
    } catch (err) {
      const message = getErrorMessage(err, t);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    setSubmitting(true);
    try {
      await transactionService.deleteBulk(selectedIds);
      toast.success(t("planned.toast.bulkDeleted"));
      setIsBulkDeleteOpen(false);
      setSelectedKeys(new Set());
      getAllPlanned();
    } catch (err) {
      const message = getErrorMessage(err, t);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedPlanned) {
      return;
    }

    setSubmitting(true);
    try {
      await transactionService.update(selectedPlanned.id, {
        paid_at: new Date().toISOString(),
      });
      toast.success(t("planned.toast.markedPaid"));
      setIsMarkPaidOpen(false);
      getAllPlanned();
    } catch (err) {
      const message = getErrorMessage(err, t);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkMarkAsPaid = async () => {
    setSubmitting(true);
    try {
      await transactionService.markManyPaid(selectedIds);
      toast.success(t("planned.toast.bulkMarkedPaid"));
      setIsBulkMarkPaidOpen(false);
      setSelectedKeys(new Set());
      getAllPlanned();
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
      getAllPlanned();
    } catch (err) {
      const message = getErrorMessage(err, t);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
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
      header: "",
      render: (row, _rowIndex, isRowHovered) => (
        <HoverRowActions
          isRowHovered={isRowHovered}
          actions={[
            ...(row.paid_at
              ? []
              : [
                  {
                    icon: CheckIcon,
                    label: t("actions.markAsPaid"),
                    variation: "primary" as const,
                    onClick: () => openMarkAsPaid(row),
                  },
                ]),
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
              variation: "destructive" as const,
              onClick: () => openDelete(row),
            },
          ]}
        />
      ),
    },
  ];

  const requestError =
    error ?? (plannedError ? translateErrorKey(plannedErrorKey, t) : null);

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
        <div className="flex items-center gap-2">
          <RefreshButton onClick={getAllPlanned} loading={loading} />
          <Button
            onClick={openCreate}
            actionsLabel={t("actions.more")}
            actions={[
              {
                label: t("planned.bulk.action"),
                onClick: openBulkCreate,
              },
            ]}
          >
            <PlusIcon className="h-5 w-5" />
            {t("actions.newPlanned")}
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

      {loading ? <p>{t("common.loading")}</p> : null}

      {!loading ? (
        <Table
          columns={columns}
          data={plannedTransactions ?? []}
          size="sm"
          getRowKey={(row) => row.id}
          emptyState={t("planned.empty")}
          selectable
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          bulkActions={[
            {
              icon: CheckIcon,
              label: t("bulkActions.markPaid"),
              variation: "primary",
              onClick: () => setIsBulkMarkPaidOpen(true),
            },
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
          initialValues={selectedPlanned ?? copySource}
          isEditing={Boolean(selectedPlanned)}
          submitLabel={t("actions.save")}
          includeDate={false}
          includeDueDate={!selectedPlanned}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={submitting}
        />
      </Modal>

      <Modal
        title={t("planned.bulk.title")}
        open={isBulkModalOpen}
        onClose={handleCloseBulkModal}
      >
        <BulkPlannedForm
          categories={categories}
          submitLabel={t("actions.save")}
          onSubmit={handleBulkSubmit}
          onCancel={handleCloseBulkModal}
          loading={submitting}
        />
      </Modal>

      <ConfirmModal
        title={t("planned.delete.title")}
        message={t("planned.delete.message")}
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        confirmType="destructive"
        loading={submitting}
      />

      <ConfirmModal
        title={t("bulkActions.deletePlanned.title")}
        message={t("bulkActions.deletePlanned.message")}
        open={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        confirmType="destructive"
        loading={submitting}
      />

      <ConfirmModal
        title={t("planned.markPaid.title")}
        message={t("planned.markPaid.message")}
        open={isMarkPaidOpen}
        onClose={() => setIsMarkPaidOpen(false)}
        onConfirm={handleMarkAsPaid}
        loading={submitting}
      />

      <ConfirmModal
        title={t("bulkActions.markPaidPlanned.title")}
        message={t("bulkActions.markPaidPlanned.message")}
        open={isBulkMarkPaidOpen}
        onClose={() => setIsBulkMarkPaidOpen(false)}
        onConfirm={handleBulkMarkAsPaid}
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
