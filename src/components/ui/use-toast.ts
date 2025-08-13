import * as React from "react"
import { ToastAction } from "@/components/ui/toast"
import { useToast as useToastPrimitive } from "@/components/ui/use-toast-primitive"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  action?: {
    label: string
    onClick: () => void
  }
}

export function useToast() {
  const { toast } = useToastPrimitive()

  return {
    toast: ({ title, description, variant, action }: ToastProps) => {
      // Create the action element separately to avoid JSX issues
      let actionElement: React.ReactNode | undefined = undefined;
      
      if (action) {
        actionElement = React.createElement(
          ToastAction,
          {
            key: 'action',
            altText: action.label,
            onClick: action.onClick
          },
          action.label
        );
      }
      
      // Call the toast function with the action element
      return toast({
        title,
        description,
        variant,
        action: actionElement
      });
    },
  }
}

export type { ToastProps }
