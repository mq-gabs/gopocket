import { useEffect, useState } from "react";
import { useRequest } from "@/hooks/use-request";
import { goalService } from "@/services/goal.service";
import type { Goal } from "@/types/models";

export interface GoalSelection {
  /** Null until the goals have loaded (or if loading failed). */
  goals: Goal[] | null;
  /** True once everything needed to show the selection has loaded. */
  ready: boolean;
  selectedIds: string[];
  toggle: (goalId: string) => void;
  /**
   * The selection to save, or undefined when it needs no saving: nothing
   * changed from what the transaction is already linked to (for a new
   * transaction, that means no goal was picked).
   */
  changedIds: string[] | undefined;
}

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((id) => b.includes(id));

/**
 * State for a "goals" field in a transaction form. Loads the goals and, when
 * editing an existing transaction (transactionId given), the ones it is
 * already linked to, which start out selected.
 */
export function useGoalSelection(transactionId?: string): GoalSelection {
  const { call: getGoals, result: goals } = useRequest({
    callback: () => goalService.getAll(),
  });
  const { call: getLinkedIds, result: linkedResult } = useRequest({
    callback: () => goalService.getTransactionGoalIds(transactionId as string),
  });

  useEffect(() => {
    getGoals();
    if (transactionId) {
      getLinkedIds();
    }
  }, [transactionId]);

  // What the user picked, once they touch the field; until then the selection
  // simply mirrors what is already linked.
  const [picked, setPicked] = useState<string[] | null>(null);

  const linkedIds = linkedResult ?? [];
  const selectedIds = picked ?? linkedIds;

  const toggle = (goalId: string) => {
    setPicked(
      selectedIds.includes(goalId)
        ? selectedIds.filter((id) => id !== goalId)
        : [...selectedIds, goalId],
    );
  };

  return {
    goals,
    ready: goals !== null && (!transactionId || linkedResult !== null),
    selectedIds,
    toggle,
    changedIds:
      picked !== null && !sameSet(picked, linkedIds) ? picked : undefined,
  };
}
