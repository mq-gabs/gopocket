"use client";

import { useI18n } from "@/contexts/i18n-context";
import type { GoalSelection } from "@/hooks/use-goal-selection";
import { GoalCheckList } from "./goal-check-list";
import { Skeleton } from "./skeleton";

interface GoalSelectFieldProps {
  selection: GoalSelection;
}

/**
 * Optional "Goals" field for a transaction form: a collapsed accordion
 * (daisyUI) that shows how many goals are selected and, once opened, lists
 * them in a scrollable area. Renders nothing when there are no goals to pick
 * from (or they could not be loaded), so it never clutters the form for
 * someone not using goals.
 */
export function GoalSelectField({ selection }: GoalSelectFieldProps) {
  const { t } = useI18n();

  if (selection.goals !== null && selection.goals.length === 0) {
    return null;
  }

  if (selection.goals === null || !selection.ready) {
    return <Skeleton className="h-11 w-full rounded-lg" />;
  }

  const title = t("goals.form.field");

  return (
    <div className="collapse collapse-arrow rounded-lg border border-light-gray">
      <input type="checkbox" aria-label={title} />
      <div className="collapse-title flex min-h-0 items-center justify-between gap-2 py-2.5 pe-10 text-sm font-medium">
        <span>{title}</span>
        <span className="text-xs font-normal text-foreground/60">
          {selection.selectedIds.length} {t("bulkActions.selected")}
        </span>
      </div>
      <div className="collapse-content">
        <GoalCheckList
          goals={selection.goals}
          selectedIds={selection.selectedIds}
          onToggle={selection.toggle}
        />
      </div>
    </div>
  );
}
