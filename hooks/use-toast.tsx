"use client"

import { useContext } from "react"
import { ToastContext, type Toast } from "../app/components/toast-provider"

/**
 * Hook to use the toast functionality provided by the ToastProvider
 * @returns Object containing toast functions and state
 */
export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}

// Re-export Toast type for convenience
export type { Toast }

export default useToast
