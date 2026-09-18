"use client";

import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { Button } from "./button";
import { useI18n } from "@/contexts/i18n-context";
import { cls } from "@/utils/cls";

interface RefreshButtonProps {
  onClick: () => void;
  loading?: boolean;
}

/** Icon-only button that refetches a page's current data (filters/mode preserved by the caller's own refetch closure). */
export function RefreshButton({ onClick, loading = false }: RefreshButtonProps) {
  const { t } = useI18n();

  return (
    <Button
      type="button"
      variation="blank"
      onClick={onClick}
      disabled={loading}
      title={t("actions.refresh")}
      aria-label={t("actions.refresh")}
      className="p-1.5!"
    >
      <ArrowPathIcon className={cls("h-5 w-5", loading ? "animate-spin" : "")} />
    </Button>
  );
}
