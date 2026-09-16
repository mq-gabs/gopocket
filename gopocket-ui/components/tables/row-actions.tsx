"use client";

import { Button, ButtonVariation } from "@/components/button";

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
        >
          <action.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
