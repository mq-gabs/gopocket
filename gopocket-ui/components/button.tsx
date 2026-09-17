"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { clsx } from "@/utils/cls";

export type ButtonVariation =
  | "primary"
  | "secondary"
  | "destructive"
  | "neutral"
  | "blank";

const mapVariationToClasses: Record<ButtonVariation, string> = {
  primary: "bg-primary-20 text-primary border border-primary",
  secondary:
    "bg-secondary-60 text-secondary-foreground border border-secondary",
  destructive: "bg-destructive/20 text-destructive border border-destructive",
  neutral: "bg-light-gray/50 text-foreground border bordr-light-gray",
  blank:
    "hover:bg-light-gray/50 border text-foreground border-transparent hover:border-light-gray",
};
const getClassByVariation = (variation: ButtonVariation): string =>
  mapVariationToClasses[variation] || mapVariationToClasses["primary"];

export interface ButtonAction {
  label: string;
  onClick: () => void;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  variation?: ButtonVariation;
  smooth?: boolean;
  /**
   * Extra actions listed in a dropdown next to the button, turning it into a
   * split/multi-action button. Omitted (or empty) renders a plain button.
   */
  actions?: ButtonAction[];
  /** Accessible label for the dropdown trigger. Only used when actions is set. */
  actionsLabel?: string;
}

/** Closes a daisyUI focus-based dropdown by dropping focus from within it. */
const closeDropdown = () => {
  (document.activeElement as HTMLElement | null)?.blur();
};

export function Button({
  children,
  onClick,
  variation = "primary",
  smooth = false,
  actions,
  actionsLabel,
  ...rest
}: ButtonProps) {
  const baseClasses = clsx({
    "text-sm hover:brightness-120 font-bold cursor-pointer px-3 py-1 rounded-xl  flex items-center justify-center gap-2": true,
    "not-hover:bg-transparent not-hover:border-transparent": smooth,
  });
  const variationClasses = getClassByVariation(variation);

  const { className: extraClasses = "", ...restProps } = rest;

  if (!actions || actions.length === 0) {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${variationClasses} ${extraClasses}`}
        {...restProps}
      >
        {children}
      </button>
    );
  }

  return (
    <div className="flex">
      <button
        onClick={onClick}
        className={`${baseClasses} ${variationClasses} rounded-r-none ${extraClasses}`}
        {...restProps}
      >
        {children}
      </button>

      <div className="dropdown dropdown-end flex">
        <button
          type="button"
          aria-label={actionsLabel}
          className={`${baseClasses} ${variationClasses} rounded-l-none border-l-0 px-1.5!`}
        >
          <ChevronDownIcon className="h-4 w-4" />
        </button>
        <ul
          tabIndex={0}
          className="menu dropdown-content z-10 mt-1 w-56 rounded-xl border border-foreground/10 bg-background p-2 text-sm shadow-md top-[28]"
        >
          {actions.map((action) => (
            <li key={action.label}>
              <button
                type="button"
                onClick={() => {
                  closeDropdown();
                  action.onClick();
                }}
              >
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
