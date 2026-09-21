"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/button";
import { ConfirmModal } from "@/components/confirm-modal";
import { GoalCard, GoalCardSkeleton } from "@/components/goal-card";
import { GoalDrawer } from "@/components/goal-drawer";
import { GoalForm } from "@/components/goal-form";
import { Modal } from "@/components/modal";
import { RefreshButton } from "@/components/refresh-button";
import { useI18n } from "@/contexts/i18n-context";
import { useRequest } from "@/hooks/use-request";
import { goalService } from "@/services/goal.service";
import type { CreateGoalPayload, Goal } from "@/types/models";
import { getErrorMessage, translateErrorKey } from "@/utils/api-error";

export default function GoalsPage() {
  const { t } = useI18n();
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>();
  const [drawerGoal, setDrawerGoal] = useState<Goal | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    call: getGoals,
    loading,
    result: goals,
    error: goalsError,
    errorKey: goalsErrorKey,
  } = useRequest({ callback: () => goalService.getAll() });

  useEffect(() => {
    getGoals();
  }, []);

  const openCreate = () => {
    setSelectedGoal(undefined);
    setIsModalOpen(true);
  };

  const openEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const openDelete = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDeleteOpen(true);
  };

  // The goal stays set while the drawer slides out, so it doesn't empty
  // during the closing animation.
  const openDrawer = (goal: Goal) => {
    setDrawerGoal(goal);
    setIsDrawerOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGoal(undefined);
  };

  const handleSubmit = async (payload: CreateGoalPayload) => {
    setSubmitting(true);
    try {
      if (selectedGoal) {
        await goalService.update(selectedGoal.id, payload);
        toast.success(t("goals.toast.updated"));
      } else {
        await goalService.create(payload);
        toast.success(t("goals.toast.created"));
      }
      setIsModalOpen(false);
      getGoals();
    } catch (err) {
      const message = getErrorMessage(err, t);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGoal) {
      return;
    }

    setSubmitting(true);
    try {
      await goalService.delete(selectedGoal.id);
      toast.success(t("goals.toast.deleted"));
      setIsDeleteOpen(false);
      getGoals();
    } catch (err) {
      const message = getErrorMessage(err, t);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const requestError =
    error ?? (goalsError ? translateErrorKey(goalsErrorKey, t) : null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-base-content">
            {t("goals.title")}
          </h1>
          <p className="mt-2 text-sm text-base-content/70">
            {t("goals.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={getGoals} loading={loading} />
          <Button onClick={openCreate}>
            <PlusIcon className="h-5 w-5" />
            {t("actions.newGoal")}
          </Button>
        </div>
      </div>

      {requestError ? (
        <div className="alert alert-error">{requestError}</div>
      ) : null}

      {!loading && !goalsError && goals?.length === 0 ? (
        <div className="rounded-3xl border border-base-300 bg-base-100 p-8 text-center text-base-content/70">
          {t("goals.empty")}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <GoalCardSkeleton key={index} />
            ))
          : (goals ?? []).map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onOpen={() => openDrawer(goal)}
                onEdit={() => openEdit(goal)}
                onDelete={() => openDelete(goal)}
              />
            ))}
      </div>

      <GoalDrawer
        open={isDrawerOpen}
        goal={drawerGoal}
        onClose={() => setIsDrawerOpen(false)}
        onChanged={getGoals}
      />

      <Modal
        title={
          selectedGoal
            ? t("goals.form.title.edit")
            : t("goals.form.title.create")
        }
        open={isModalOpen}
        onClose={handleCloseModal}
      >
        <GoalForm
          initialValues={selectedGoal}
          submitLabel={t("actions.save")}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={submitting}
        />
      </Modal>

      <ConfirmModal
        title={t("goals.delete.title")}
        message={t("goals.delete.message")}
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        confirmType="destructive"
        loading={submitting}
      />
    </div>
  );
}
