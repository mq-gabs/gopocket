"use client";

import { Button } from "./button";
import { Modal } from "./modal";

interface ConfirmModalProps {
  title: string;
  message: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({ title, message, open, onClose, onConfirm }: ConfirmModalProps) {
  return (
    <Modal title={title} open={open} onClose={onClose}>
      <p className="mb-6 text-sm text-base-content/70">{message}</p>
      <div className="flex justify-end gap-3">
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
