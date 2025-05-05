"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTodoContext } from "../components/todo-provider"
import { CheckCircle, CircleAlert, Clock, ListChecks } from "lucide-react"
import { cn } from "@/lib/utils"

export function TaskStats() {
  const { tasks } = useTodoContext()

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate || task.completed) return false
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < today
  }).length

  const dueTodayTasks = tasks.filter((task) => {
    if (!task.dueDate || task.completed) return false
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate.getTime() === today.getTime()
  }).length

  // Helper function to get width class based on percentage
  const getWidthClass = (percentage: number) => {
    // Round to the nearest 5% for better class matching
    const roundedPercentage = Math.round(percentage / 5) * 5

    switch (roundedPercentage) {
      case 0:
        return "w-0"
      case 5:
        return "w-[5%]"
      case 10:
        return "w-[10%]"
      case 15:
        return "w-[15%]"
      case 20:
        return "w-1/5"
      case 25:
        return "w-1/4"
      case 30:
        return "w-[30%]"
      case 33:
        return "w-1/3"
      case 35:
        return "w-[35%]"
      case 40:
        return "w-2/5"
      case 45:
        return "w-[45%]"
      case 50:
        return "w-1/2"
      case 55:
        return "w-[55%]"
      case 60:
        return "w-3/5"
      case 65:
        return "w-[65%]"
      case 66:
        return "w-2/3"
      case 70:
        return "w-[70%]"
      case 75:
        return "w-3/4"
      case 80:
        return "w-4/5"
      case 85:
        return "w-[85%]"
      case 90:
        return "w-[90%]"
      case 95:
        return "w-[95%]"
      case 100:
        return "w-full"
      default:
        return `w-[${roundedPercentage}%]`
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <ListChecks className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTasks}</div>
          <p className="text-xs text-muted-foreground">
            {completedTasks} completed, {totalTasks - completedTasks} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate}%</div>
          <div className="mt-2 h-2 w-full rounded-full bg-muted">
            {/* Progress bar with proper ARIA attributes */}
            <div
              className={cn("h-2 rounded-full bg-primary", getWidthClass(completionRate))}
              role="progressbar"
              aria-label="Task completion rate"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          <CircleAlert className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overdueTasks}</div>
          <p className="text-xs text-muted-foreground">Tasks that are past their due date</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Due Today</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dueTodayTasks}</div>
          <p className="text-xs text-muted-foreground">Tasks that need to be completed today</p>
        </CardContent>
      </Card>
    </div>
  )
}
