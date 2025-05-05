"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "../components/auth-provider"
import { useTodoContext } from "../components/todo-provider"
import { TaskList } from "../components/task-list"
import { TaskFilters } from "../components/task-filters"
import { TaskForm } from "../components/task-form"
import { TaskStats } from "../components/task-stats"
import { PlusCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function TaskDashboard() {
  const { user } = useAuth()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { tasks: _, filteredTasks } = useTodoContext()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  if (!user) return null

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground">Here&apos;s an overview of your tasks and progress.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new task</DialogTitle>
            </DialogHeader>
            <TaskForm />
          </DialogContent>
        </Dialog>
      </div>

      <TaskStats />

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <TaskFilters />

        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>
              {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaskList />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
