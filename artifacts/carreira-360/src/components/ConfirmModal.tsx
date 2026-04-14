import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Alterações Não Guardadas",
  description = "Tens alterações pendentes no teu perfil. Se saíres agora, as tuas modificações serão perdidas.",
  confirmLabel = "Sair sem guardar",
  cancelLabel = "Continuar a editar"
}: ConfirmModalProps) {
  return (
    <ResponsiveDialog
      isOpen={isOpen}
      setIsOpen={(open) => !open && onClose()}
      title={title}
      className="sm:max-w-md"
    >
      <div className="flex flex-col items-center text-center py-6">
        <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-4 animate-pulse">
           <AlertTriangle size={32} />
        </div>
        <p className="text-sm font-medium text-[#001F33]/80 leading-relaxed px-4">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <Button 
          variant="ghost" 
          onClick={onClose}
          className="uppercase tracking-widest font-black text-[10px] h-12 rounded-xl text-[#001F33]/60 hover:bg-[#001F33]/5"
        >
          {cancelLabel}
        </Button>
        <Button 
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="bg-red-500 hover:bg-red-600 text-white uppercase tracking-widest font-black text-[10px] h-12 rounded-xl shadow-lg shadow-red-500/20"
        >
          {confirmLabel}
        </Button>
      </div>
    </ResponsiveDialog>
  );
}
