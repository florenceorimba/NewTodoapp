"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// Define ToastVariant as a union of specific string literals
export type ToastVariant = "default" | "destructive" | "success"

export type Toast = {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

type ToastContextType = {
  toasts: Toast[]
  toast: (props: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [visibleToasts, setVisibleToasts] = useState<string[]>([])

  const toast = useCallback((props: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)

    // Ensure variant is properly typed as ToastVariant
    const newToast: Toast = {
      id,
      duration: 5000,
      variant: "default",
      ...props,
    }

    setToasts((prev) => [...prev, newToast])

    // Add to visible toasts with a slight delay for animation
    setTimeout(() => {
      setVisibleToasts((prev) => [...prev, id])
    }, 10)

    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    // First remove from visible toasts to trigger animation
    setVisibleToasts((prev) => prev.filter((toastId) => toastId !== id))

    // Then remove from toasts array after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 300)
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer visibleToasts={visibleToasts} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

function ToastContainer({ visibleToasts }: { visibleToasts: string[] }) {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-md w-full">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => dismiss(toast.id)}
          visible={visibleToasts.includes(toast.id)}
        />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss, visible }: { toast: Toast; onDismiss: () => void; visible: boolean }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss()
    }, toast.duration || 5000)

    return () => clearTimeout(timer)
  }, [toast.duration, onDismiss])

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all duration-300",
        toast.variant === "destructive" && "border-destructive bg-destructive text-destructive-foreground",
        toast.variant === "success" && "border-green-600 bg-green-600 text-white",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      )}
    >
      <div className="grid gap-1">
        {toast.title && <div className="text-sm font-semibold">{toast.title}</div>}
        {toast.description && <div className="text-sm opacity-90">{toast.description}</div>}
      </div>
      <button
        onClick={onDismiss}
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2"
        aria-label="Close notification"
        title="Close notification"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}
