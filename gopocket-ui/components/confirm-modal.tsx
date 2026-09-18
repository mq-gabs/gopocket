"use client";

import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useI18n } from "@/contexts/i18n-context";
import { Button, ButtonVariation } from "./button";
import { Modal } from "./modal";
import { TranslationKey } from "@/locales";

type ConfirmType = 'default' | 'destructive';

interface ConfirmModalProps {
  title: string;
  message: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmType?: ConfirmType;
  loading?: boolean;
}

const getConfirmButtonVariationAndText: (
  type: ConfirmType,
) => { variation: ButtonVariation; text: TranslationKey; loadingText: TranslationKey } = (
  type: ConfirmType,
) => {
  switch (type) {
    case "destructive":
      return {
        variation: "destructive",
        text: "actions.delete",
        loadingText: "actions.deleting",
      };
    case "default":
    default:
      return {
        variation: "primary",
        text: "actions.confirm",
        loadingText: "actions.confirming",
      };
  }
}

export function ConfirmModal({
  title,
  message,
  open,
  onClose,
  onConfirm,
  confirmType = "default",
  loading = false,
}: ConfirmModalProps) {
  const { t } = useI18n();
  const { variation, text, loadingText } =
    getConfirmButtonVariationAndText(confirmType);
  return (
    <Modal title={title} open={open} onClose={onClose}>
      <p className="mb-6 text-sm text-base-content/70">{message}</p>
      <div className="flex justify-end gap-3">
        <Button onClick={onClose} variation="neutral">
          {t("actions.cancel")}
        </Button>
        <Button onClick={onConfirm} variation={variation} disabled={loading}>
          {loading ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              {t(loadingText)}
            </>
          ) : (
            t(text)
          )}
        </Button>
      </div>
    </Modal>
  );
}
