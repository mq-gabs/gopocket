"use client";

import { useEffect, useMemo, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ConfirmModal } from "@/components/confirm-modal";
import { Modal } from "@/components/modal";
import { TransactionForm } from "@/components/transaction-form";
import { useI18n } from "@/contexts/i18n-context";
import { categoryService } from "@/services/category.service";
import { transactionService } from "@/services/transaction.service";
import type { Category, CreateTransactionPayload, Transaction, UpdateTransactionPayload } from "@/types/models";
import { Button } from "@/components/button";

export default function TransactionsPage() {
  const { t } = useI18n();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionData, categoryData] = await Promise.all([
        transactionService.getAll(),
        categoryService.getAll(),
      ]);
      setTransactions(transactionData);
      setCategories(categoryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);

  const openCreate = () => {
    setSelectedTransaction(undefined);
    setIsModalOpen(true);
  };

  const openEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const openDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (payload: CreateTransactionPayload | UpdateTransactionPayload) => {
    try {
      if (selectedTransaction) {
        await transactionService.update(selectedTransaction.id, payload as UpdateTransactionPayload);
      } else {
        await transactionService.create(payload as CreateTransactionPayload);
      }
      setIsModalOpen(false);
      await loadData();
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
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-base-content">{t("transactions.title")}</h1>
          <p className="mt-2 text-sm text-base-content/70">{t("transactions.description")}</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="h-5 w-5" />
          {t("actions.newTransaction")}
        </Button>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      {loading ? <p>{t("common.loading")}</p> : null}

      {!loading && transactions.length === 0 ? (
        <div className="rounded-3xl border border-base-300 bg-base-100 p-8 text-center text-base-content/70">
          {t("transactions.empty")}
        </div>
      ) : null}

      {!loading && transactions.length > 0 ? (
        <div className="overflow-x-auto rounded-3xl border border-base-300 bg-base-100 shadow-sm">
          <table className="table">
            <thead>
              <tr>
                <th>{t("transactions.table.title")}</th>
                <th>{t("transactions.table.description")}</th>
                <th>{t("transactions.table.amount")}</th>
                <th>{t("transactions.table.type")}</th>
                <th>{t("transactions.table.category")}</th>
                <th>{t("transactions.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                const category = categoryMap.get(transaction.category_id);
                return (
                  <tr key={transaction.id}>
                    <td className="font-medium text-base-content">{transaction.title}</td>
                    <td className="text-base-content/70">{transaction.description}</td>
                    <td className="text-base-content">{transaction.amount}</td>
                    <td className="text-base-content">{transaction.type}</td>
                    <td>
                      {category ? (
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm" style={{ backgroundColor: `${category.color}22`, color: category.color }}>
                            {category.icon}
                          </span>
                          <span className="font-medium" style={{ color: category.color }}>
                            {category.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-base-content/60">—</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button onClick={() => openEdit(transaction)}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => openDelete(transaction)}>
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal title={selectedTransaction ? t("transactions.form.title.edit") : t("transactions.form.title.create")} open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <TransactionForm
          categories={categories}
          initialValues={selectedTransaction}
          submitLabel={t("actions.save")}
          onSubmit={handleSubmit}
        />
      </Modal>

      <ConfirmModal
        title={t("transactions.delete.title")}
        message={t("transactions.delete.message")}
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
