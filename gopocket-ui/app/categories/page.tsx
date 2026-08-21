"use client";

import { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CategoryForm } from "@/components/category-form";
import { ConfirmModal } from "@/components/confirm-modal";
import { Modal } from "@/components/modal";
import { useI18n } from "@/contexts/i18n-context";
import { categoryService } from "@/services/category.service";
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from "@/types/models";
import { Button } from "@/components/button";
import { CategoryCard } from "@/components/category-card";

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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(undefined);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-base-content">{t("categories.title")}</h1>
          <p className="mt-2 text-sm text-base-content/70">{t("categories.description")}</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="h-5 w-5" />
          {t("actions.newCategory")}
        </Button>
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
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={() => openEdit(category)}
            onDelete={() => openDelete(category)}
          />
        ))}
      </div>

      <Modal title={selectedCategory ? t("categories.form.title.edit") : t("categories.form.title.create")} open={isModalOpen} onClose={handleCloseModal}>
        <CategoryForm
          initialValues={selectedCategory}
          submitLabel={selectedCategory ? t("actions.save") : t("actions.save")}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>

      <ConfirmModal
        title={t("categories.delete.title")}
        message={t("categories.delete.message")}
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        confirmType="destructive"
      />
    </div>
  );
}
