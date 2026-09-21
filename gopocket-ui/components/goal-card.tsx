"use client";

import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useI18n } from "@/contexts/i18n-context";
import type { Goal } from "@/types/models";
import { Button } from "./button";
import { GoalSummary } from "./goal-summary";
import { Skeleton } from "./skeleton";

interface GoalCardProps {
  goal: Goal;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function GoalCard({ goal, onOpen, onEdit, onDelete }: GoalCardProps) {
  const { t } = useI18n();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        // Enter/Space on the edit/delete buttons bubble up here too.
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className="flex cursor-pointer flex-col gap-4 rounded-xl border border-foreground/15 bg-foreground/5 p-4 outline-primary transition hover:border-primary/60"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold" title={goal.name}>
            {goal.name}
          </h3>
          {goal.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-foreground/60">
              {goal.description}
            </p>
          ) : null}
        </div>
        <div
          className="flex shrink-0 gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            className="p-1!"
            variation="neutral"
            onClick={onEdit}
            title={t("actions.edit")}
            aria-label={t("actions.edit")}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            className="p-1!"
            variation="destructive"
            onClick={onDelete}
            title={t("actions.delete")}
            aria-label={t("actions.delete")}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <GoalSummary goal={goal} />
    </div>
  );
}

export function GoalCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-foreground/15 bg-foreground/5 p-4">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-40 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-6 rounded-lg" />
          <Skeleton className="h-6 w-6 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-6 w-48 rounded-lg" />
      <Skeleton className="h-2.5 w-full rounded-full" />
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
      <Skeleton className="h-4 w-24 rounded-lg" />
    </div>
  );
}
