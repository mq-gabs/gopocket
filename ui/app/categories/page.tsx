"use client";

import { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CategoryForm } from "@/components/category-form";
import { ConfirmModal } from "@/components/confirm-modal";
import { Modal } from "@/components/modal";
import { useI18n } from "@/contexts/i18n-context";
import { categoryService } from "@/services/category.service";
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from "@/types/models";

export default function CategoriesPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const openCreate = () => {
    setSelectedCategory(undefined);
    setIsModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const openDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (payload: CreateCategoryPayload | UpdateCategoryPayload) => {
    try {
      if (selectedCategory) {
        await categoryService.update(selectedCategory.id, payload as UpdateCategoryPayload);
      } else {
        await categoryService.create(payload as CreateCategoryPayload);
      }
      setIsModalOpen(false);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) {
      return;
    }

    try {
      await categoryService.delete(selectedCategory.id);
      setIsDeleteOpen(false);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-base-content">{t("categories.title")}</h1>
          <p className="mt-2 text-sm text-base-content/70">{t("categories.description")}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <PlusIcon className="h-5 w-5" />
          {t("actions.newCategory")}
        </button>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      {loading ? <p>{t("common.loading")}</p> : null}

      {!loading && categories.length === 0 ? (
        <div className="rounded-3xl border border-base-300 bg-base-100 p-8 text-center text-base-content/70">
          {t("categories.empty")}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="group relative overflow-hidden rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: category.color }}>
                  <span className="text-lg text-white">{category.icon}</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-base-content">{category.name}</h2>
                  <p className="text-sm text-base-content/70">{category.type}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-2 opacity-0 transition group-hover:opacity-100">
              <button className="btn btn-sm btn-ghost" onClick={() => openEdit(category)}>
                <PencilIcon className="h-4 w-4" />
                {t("actions.edit")}
              </button>
              <button className="btn btn-sm btn-error" onClick={() => openDelete(category)}>
                <TrashIcon className="h-4 w-4" />
                {t("actions.delete")}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal title={selectedCategory ? t("categories.form.title.edit") : t("categories.form.title.create")} open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CategoryForm
          initialValues={selectedCategory}
          submitLabel={selectedCategory ? t("actions.save") : t("actions.save")}
          onSubmit={handleSubmit}
        />
      </Modal>

      <ConfirmModal
        title={t("categories.delete.title")}
        message={t("categories.delete.message")}
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
