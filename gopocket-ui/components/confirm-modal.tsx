"use client";

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
}

const getConfirmButtonVariationAndText: (type: ConfirmType) => { variation: ButtonVariation; text: TranslationKey} = (type: ConfirmType) => {
  switch (type) {
    case "destructive":
      return { variation: "destructive", text: "actions.delete" };
    case "default":
    default:
      return { variation: "primary", text: "actions.confirm" };
  }
}

export function ConfirmModal({
  title,
  message,
  open,
  onClose,
  onConfirm,
  confirmType = "default"
}: ConfirmModalProps) {
  const { t } = useI18n();
  const { variation, text } = getConfirmButtonVariationAndText(confirmType);
  return (
    <Modal title={title} open={open} onClose={onClose}>
      <p className="mb-6 text-sm text-base-content/70">{message}</p>
      <div className="flex justify-end gap-3">
        <Button onClick={onClose} variation="neutral">
          {t("actions.cancel")}
        </Button>
        <Button onClick={onConfirm} variation={variation}>
          {t(text)}
        </Button>
      </div>
    </Modal>
  );
}
