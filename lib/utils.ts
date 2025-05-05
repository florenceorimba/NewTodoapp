import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function isOverdue(date: Date | string): boolean {
  const dueDate = typeof date === "string" ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return dueDate < today
}

export function getDueDateStatus(date: Date | string | undefined): "overdue" | "today" | "upcoming" | "none" {
  if (!date) return "none"

  const dueDate = typeof date === "string" ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (dueDate < today) return "overdue"
  if (dueDate.toDateString() === today.toDateString()) return "today"
  return "upcoming"
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

// Add this new function to handle category color dots
export function applyCategoryColor(element: HTMLElement | null, color: string | undefined) {
  if (element && color) {
    element.style.backgroundColor = color
  }
}
