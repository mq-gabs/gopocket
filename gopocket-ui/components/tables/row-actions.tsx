"use client";

import { Button, ButtonVariation } from "@/components/button";
import { cls } from "@/utils/cls";

export interface RowAction {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  variation?: ButtonVariation;
  onClick: () => void;
}

export function RowActions({ actions }: { actions: RowAction[] }) {
  return (
    <div className="flex gap-2">
      {actions.map((action) => (
        <Button
          key={action.label}
          className="p-1!"
          variation={action.variation ?? "neutral"}
          onClick={action.onClick}
          title={action.label}
          aria-label={action.label}
          smooth
        >
          <action.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}

/**
 * Floats the row actions above the row via absolute positioning, so the
 * actions column never reserves layout space and hovering never shifts the
 * table. Only visible (and interactive) while isRowHovered is true.
 */
export function HoverRowActions({
  actions,
  isRowHovered,
}: {
  actions: RowAction[];
  isRowHovered: boolean;
}) {
  return (
    <div
      className={cls(
        "absolute inset-y-0 right-2 z-10 flex items-center gap-2 rounded-lg bg-background pl-3 shadow-md border border-foreground/10  transition-opacity duration-150 bottom-[32] top-[-32] ",
        isRowHovered ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <RowActions actions={actions} />
    </div>
  );
}
