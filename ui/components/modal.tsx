"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ title, open, onClose, children }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-300/60 px-4">
      <div className="w-full max-w-xl rounded-3xl border border-base-300 bg-base-100 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-base-content">{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
