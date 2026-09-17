"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button, ButtonVariation } from "@/components/button";
import { useI18n } from "@/contexts/i18n-context";

export interface BulkAction {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  variation?: ButtonVariation;
  onClick: () => void;
}

interface BulkActionsBarProps {
  count: number;
  actions: BulkAction[];
  onClear: () => void;
}

/**
 * Floating overlay pinned to the bottom center of the viewport, shown while
 * one or more table rows are selected. Renders only while count > 0.
 */
export function BulkActionsBar({
  count,
  actions,
  onClear,
}: BulkActionsBarProps) {
  const { t } = useI18n();

  if (count === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 rounded-2xl border border-foreground/10 bg-background px-4 py-2.5 shadow-lg">
      <span className="text-sm font-medium whitespace-nowrap text-foreground/80">
        {count} {t("bulkActions.selected")}
      </span>
      <div className="flex gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variation={action.variation ?? "neutral"}
            onClick={action.onClick}
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </div>
      <Button
        variation="blank"
        className="p-1!"
        onClick={onClear}
        title={t("bulkActions.clear")}
        aria-label={t("bulkActions.clear")}
        smooth
      >
        <XMarkIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
