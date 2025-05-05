"use client"

import { useState } from "react"
import { useTodoContext } from "../components/todo-provider"
import { TaskItem } from "../components/task-item"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function TaskList() {
  const { filteredTasks, toggleTaskCompletion, deleteTask } = useTodoContext()
  const { toast } = useToast()
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [isSelectMode, setIsSelectMode] = useState(false)

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId)
      } else {
        return [...prev, taskId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(filteredTasks.map((task) => task.id))
    }
  }

  const handleDeleteSelected = () => {
    selectedTasks.forEach((taskId) => {
      deleteTask(taskId)
    })

    toast({
      title: "Tasks deleted",
      description: `${selectedTasks.length} tasks have been deleted.`,
      variant: "success",
    })

    setSelectedTasks([])
    setIsSelectMode(false)
  }

  const handleMarkSelectedComplete = (completed: boolean) => {
    selectedTasks.forEach((taskId) => {
      toggleTaskCompletion(taskId)
    })

    toast({
      title: `Tasks marked as ${completed ? "completed" : "incomplete"}`,
      description: `${selectedTasks.length} tasks have been updated.`,
      variant: "success",
    })

    setSelectedTasks([])
    setIsSelectMode(false)
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Trash2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No tasks found</h3>
        <p className="text-muted-foreground mt-1">Try adjusting your filters or create a new task.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {isSelectMode && (
        <div className="flex items-center justify-between bg-muted p-2 rounded-md mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
              onCheckedChange={handleSelectAll}
              id="select-all"
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              {selectedTasks.length} selected
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMarkSelectedComplete(true)}
              disabled={selectedTasks.length === 0}
            >
              Mark Complete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMarkSelectedComplete(false)}
              disabled={selectedTasks.length === 0}
            >
              Mark Incomplete
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={selectedTasks.length === 0}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete the selected tasks.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteSelected}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsSelectMode(false)
                setSelectedTasks([])
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {!isSelectMode && (
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm" onClick={() => setIsSelectMode(true)}>
            Select Tasks
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isSelectMode={isSelectMode}
            isSelected={selectedTasks.includes(task.id)}
            onSelect={handleSelectTask}
          />
        ))}
      </div>
    </div>
  )
}
