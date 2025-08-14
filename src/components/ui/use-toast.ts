import { useToast as useToastPrimitive } from "@/components/ui/use-toast-primitive"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const { toast, dismiss } = useToastPrimitive()
  
  return {
    toast: ({ title, description, variant }: ToastProps) => {
      return toast({
        title,
        description,
        variant
      })
    },
    dismiss: (toastId?: string) => {
      if (toastId) {
        dismiss(toastId)
      }
    }
  }
}

export type { ToastProps }
