import * as React from "react"
import { Drawer } from "vaul"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface ResponsiveDialogProps {
  children: React.ReactNode
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  title?: string
  description?: string
  className?: string
}

export function ResponsiveDialog({
  children,
  isOpen,
  setIsOpen,
  title,
  description,
  className,
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[32px] border-t-2 border-[#001F33]/35 bg-[#F3E9DD] p-6 shadow-2xl focus:outline-none">
            <div className="flex justify-between items-center mb-4">
              <div className="mx-auto h-1.5 w-12 shrink-0 rounded-full bg-[#001F33]/10 ml-[50%] -translate-x-[50%]" />
              <Drawer.Close asChild>
                <button className="h-10 w-10 bg-[#001F33]/5 rounded-full flex items-center justify-center text-[#001F33] active:scale-95 transition-all">
                   <X className="h-5 w-5" />
                </button>
              </Drawer.Close>
            </div>
            {(title || description) && (
              <div className="mb-6 space-y-2 text-center">
                {title && (
                  <Drawer.Title className="text-2xl font-display uppercase tracking-tight text-[#001F33]">
                    {title}
                  </Drawer.Title>
                )}
                {description && (
                  <Drawer.Description className="text-sm font-medium text-[#001F33]/40">
                    {description}
                  </Drawer.Description>
                )}
              </div>
            )}
            <div className={cn("overflow-y-auto max-h-[85dvh]", className)}>
              {children}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={cn("sm:max-w-[525px]", className)}>
        {(title || description) && (
          <DialogHeader className="mb-4">
            {title && <DialogTitle className="text-2xl font-display uppercase tracking-tight text-[#001F33]">{title}</DialogTitle>}
            {description && <DialogDescription className="text-[#001F33]/40">{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
}
