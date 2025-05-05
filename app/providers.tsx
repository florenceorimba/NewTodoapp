"use client"

import type React from "react"

import { TodoProvider } from "./components/todo-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return <TodoProvider>{children}</TodoProvider>
}
