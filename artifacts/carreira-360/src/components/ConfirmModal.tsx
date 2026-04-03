import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default"
}: ConfirmModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white border-2 border-[#001F33]/10 text-[#001F33] rounded-3xl p-8">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-display uppercase text-[#001F33]">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#001F33]/70 font-medium">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex gap-3">
          <AlertDialogCancel onClick={onClose} className="border-[#001F33]/10 text-[#001F33]/60 uppercase font-bold text-xs h-12 rounded-xl">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`uppercase font-bold text-xs h-12 px-8 rounded-xl ${
              variant === "destructive" 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-[#0EA5E9] hover:bg-[#001F33] text-white"
            }`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
