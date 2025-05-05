"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useTodoContext, type Task } from "../components/todo-provider"
import { TaskForm } from "../components/task-form"
import { cn, formatDate, getDueDateStatus } from "@/lib/utils"
import { Calendar, Edit, MoreHorizontal, Tag, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CategoryColorDot } from "../components/category-color-dot"

interface TaskItemProps {
  task: Task
  isSelectMode?: boolean
  isSelected?: boolean
  onSelect?: (taskId: string) => void
}

export function TaskItem({ task, isSelectMode = false, isSelected = false, onSelect }: TaskItemProps) {
  const { toggleTaskCompletion, deleteTask, categories, updateSubtask, deleteSubtask } = useTodoContext()
  const [isSubtasksOpen, setIsSubtasksOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const category = categories.find((c) => c.id === task.categoryId)
  const dueDateStatus = getDueDateStatus(task.dueDate)

  const handleToggleCompletion = () => {
    toggleTaskCompletion(task.id)
  }

  const handleDelete = () => {
    deleteTask(task.id)
  }

  const handleToggleSubtask = (subtaskId: string, completed: boolean) => {
    updateSubtask(task.id, subtaskId, completed)
  }

  const handleDeleteSubtask = (subtaskId: string) => {
    deleteSubtask(task.id, subtaskId)
  }

  return (
    <Card
      className={cn(
        "task-item transition-all duration-300 ease-in-out",
        `priority-${task.priority}`,
        task.completed && "completed",
        isHovered && "shadow-md transform -translate-y-1",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {isSelectMode ? (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect?.(task.id)}
              className="mt-1 transition-all duration-200 hover:scale-110"
            />
          ) : (
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleToggleCompletion}
              className="mt-1 transition-all duration-200 hover:scale-110"
            />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={cn(
                  "font-medium line-clamp-2 transition-all duration-200",
                  task.completed && "line-through text-muted-foreground",
                )}
              >
                {task.title}
              </h3>

              {!isSelectMode && (
                <div className="flex items-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:scale-110"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit task</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit task</DialogTitle>
                      </DialogHeader>
                      <TaskForm task={task} mode="edit" />
                    </DialogContent>
                  </Dialog>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:scale-110"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="animate-in fade-in-50 zoom-in-95 duration-200">
                      <DropdownMenuItem
                        onClick={handleToggleCompletion}
                        className="transition-colors duration-200 hover:bg-accent cursor-pointer"
                      >
                        {task.completed ? "Mark as incomplete" : "Mark as complete"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="transition-colors duration-200 hover:bg-destructive/10 text-destructive cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="animate-in fade-in-50 zoom-in-95 duration-200">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete this task.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="transition-all duration-200 hover:bg-secondary/80 active:scale-95">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              className="transition-all duration-200 hover:bg-destructive/90 active:scale-95"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {task.description && (
              <p
                className={cn(
                  "text-sm text-muted-foreground mt-1 transition-all duration-200",
                  task.completed && "line-through",
                )}
              >
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {category && (
                <div className="flex items-center transition-all duration-200 hover:scale-105">
                  <Tag className="h-3 w-3 mr-1" />
                  <Badge variant="outline" className="text-xs font-normal transition-all duration-200 hover:bg-accent">
                    <CategoryColorDot color={category?.color || ""} className="w-2 h-2 mr-1" />
                    {category.name}
                  </Badge>
                </div>
              )}

              {task.dueDate && (
                <div className="flex items-center transition-all duration-200 hover:scale-105">
                  <Calendar className="h-3 w-3 mr-1" />
                  <Badge
                    variant={
                      dueDateStatus === "overdue" ? "destructive" : dueDateStatus === "today" ? "outline" : "secondary"
                    }
                    className="text-xs font-normal transition-all duration-200 hover:opacity-80"
                  >
                    {formatDate(task.dueDate)}
                  </Badge>
                </div>
              )}

              <Badge
                variant={
                  task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"
                }
                className="text-xs transition-all duration-200 hover:scale-105 hover:opacity-80"
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
            </div>

            {task.subtasks && task.subtasks.length > 0 && (
              <Collapsible open={isSubtasksOpen} onOpenChange={setIsSubtasksOpen} className="mt-3">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto text-xs text-muted-foreground transition-all duration-200 hover:text-foreground hover:underline"
                  >
                    {isSubtasksOpen ? "Hide" : "Show"} subtasks ({task.subtasks.filter((st) => st.completed).length}/
                    {task.subtasks.length})
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
                  {task.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-2 pl-2 border-l-2 border-muted transition-all duration-200 hover:border-primary hover:bg-accent/30 rounded-r-md p-1"
                    >
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={(checked) => handleToggleSubtask(subtask.id, checked as boolean)}
                        id={`subtask-${subtask.id}\`}  checked as boolean)}
                        id={\`subtask-${subtask.id}`}
                        className="transition-all duration-200 hover:scale-110"
                      />
                      <label
                        htmlFor={`subtask-${subtask.id}`}
                        className={cn(
                          "text-sm flex-1 transition-all duration-200",
                          subtask.completed && "line-through text-muted-foreground",
                        )}
                      >
                        {subtask.title}
                      </label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:scale-110"
                        onClick={() => handleDeleteSubtask(subtask.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="sr-only">Delete subtask</span>
                      </Button>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
