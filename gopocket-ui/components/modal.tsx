"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "./button";
import { makeOnKeyDown } from "@/utils/key";
import { useEffect, useRef } from "react";

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ title, open, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open && ref.current) {
      ref.current.focus();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <dialog className="modal modal-open" onKeyDown={makeOnKeyDown('Escape', onClose)} tabIndex={0} ref={ref}>
      <div className="modal-box bg-background" >
         <div className="mb-6 flex items-center justify-between">
           <h3 className="text-xl font-semibold text-base-content">{title}</h3>
           <Button onClick={onClose} className="p-2!" variation="blank">
             <XMarkIcon className="h-4 w-4" />
           </Button>
         </div>
         {children}
      </div>
      <div onClick={onClose} className="modal-backdrop">
      </div>
    </dialog>
  );
}
