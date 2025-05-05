"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTodoContext } from "../components/todo-provider"
import { ListTodo, Home, Calendar, Tag, Settings, ChevronLeft, ChevronRight, PlusCircle } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { CategoryColorDot } from "../components/category-color-dot"
import { useMobile } from "@/hooks/use-mobile"

export function Sidebar() {
  const pathname = usePathname()
  const { categories } = useTodoContext()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const isMobile = useMobile()

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true)
    }
  }, [isMobile])

  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "All Tasks",
      href: "/dashboard/tasks",
      icon: <ListTodo className="h-5 w-5" />,
    },
    {
      title: "Calendar",
      href: "/dashboard/calendar",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "Categories",
      href: "/dashboard/categories",
      icon: <Tag className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  const SidebarContent = () => (
    <div className={cn("h-full flex flex-col border-r bg-background", isCollapsed ? "w-16" : "w-64")}>
      <div className="flex h-16 items-center border-b px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">TodoApp</h1>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto">
            <ListTodo className="h-6 w-6 text-primary" />
          </div>
        )}
        {!isMobile && (
          <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-2 px-2">
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn("w-full justify-start", isCollapsed && "justify-center px-0")}
              >
                {item.icon}
                {!isCollapsed && <span className="ml-2">{item.title}</span>}
              </Button>
            </Link>
          ))}
        </nav>

        {!isCollapsed && (
          <div className="mt-6">
            <div className="px-4 mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium">Categories</h3>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-1 px-2">
              {categories.map((category) => (
                <Link key={category.id} href={`/dashboard/category/${category.id}`}>
                  <Button variant="ghost" className="w-full justify-start">
                    <CategoryColorDot color={category.color} className="w-2 h-2" />
                    <span className="ml-2 truncate">{category.name}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {category.count || 0}
                    </Badge>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden absolute left-4 top-4 z-20">
            <ListTodo className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    )
  }

  return <SidebarContent />
}
