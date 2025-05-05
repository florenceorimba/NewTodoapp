import type React from "react"
import { Sidebar } from "../components/sidebar"
import { Header } from "../components/header"
import { Providers } from "@/app/providers"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // In a real app, we would check server-side auth here
  // For this demo, we'll handle auth check in the client components

  return (
    <Providers>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </Providers>
  )
}
