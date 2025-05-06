"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DayPicker } from "react-day-picker"
import { useTodoContext, type Task, type Priority, type SubTask } from "../components/todo-provider"
import { CalendarIcon, Plus, X } from "lucide-react"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { CategoryColorDot } from "../components/category-color-dot"
import { generateId } from "@/lib/utils"

// Import the CSS for react-day-picker
import "react-day-picker/dist/style.css"

interface TaskFormProps {
  task?: Task
  mode?: "create" | "edit"
  onSuccess?: () => void
}

// Define the subtask schema to match the SubTask type
const subtaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Subtask title is required"),
  completed: z.boolean(),
})

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  categoryId: z.string().optional(),
  dueDate: z.date().optional(),
  subtasks: z.array(subtaskSchema).optional(),
})

type FormValues = z.infer<typeof formSchema>

export function TaskForm({ task, mode = "create", onSuccess }: TaskFormProps) {
  const { addTask, updateTask, categories } = useTodoContext()
  const [newSubtask, setNewSubtask] = useState("")

  // Ensure subtasks have required fields
  const prepareSubtasks = (subtasks?: SubTask[]): SubTask[] => {
    if (!subtasks) return []
    return subtasks.map((subtask) => ({
      id: subtask.id,
      title: subtask.title,
      completed: subtask.completed,
    }))
  }

  const defaultValues: FormValues = {
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || "medium",
    categoryId: task?.categoryId,
    dueDate: task?.dueDate ? new Date(task.dueDate) : undefined,
    subtasks: prepareSubtasks(task?.subtasks),
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const onSubmit = (data: FormValues) => {
    if (mode === "create") {
      addTask({
        title: data.title,
        description: data.description,
        priority: data.priority as Priority,
        categoryId: data.categoryId,
        dueDate: data.dueDate?.toISOString(),
        completed: false,
        subtasks: data.subtasks,
      })
    } else {
      updateTask(task!.id, {
        title: data.title,
        description: data.description,
        priority: data.priority as Priority,
        categoryId: data.categoryId,
        dueDate: data.dueDate?.toISOString(),
        subtasks: data.subtasks,
      })
    }

    if (onSuccess) {
      onSuccess()
    }

    form.reset(defaultValues)
  }

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return

    const currentSubtasks = form.getValues("subtasks") || []
    form.setValue("subtasks", [
      ...currentSubtasks,
      {
        id: generateId(),
        title: newSubtask,
        completed: false,
      },
    ])

    setNewSubtask("")
  }

  const handleRemoveSubtask = (index: number) => {
    const currentSubtasks = form.getValues("subtasks") || []
    form.setValue(
      "subtasks",
      currentSubtasks.filter((_, i) => i !== index),
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add details about this task"
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center">
                          <CategoryColorDot color={category.color} className="w-2 h-2 mr-2" />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : "Select a date"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DayPicker
                    mode="single"
                    modifiers={{ selected: field.value }}
                    onDayClick={(day, modifiers) => {
                      if (modifiers.selected) {
                        field.onChange(undefined)
                      } else {
                        field.onChange(day)
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label>Subtasks</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a subtask"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddSubtask()
                }
              }}
            />
            <Button type="button" onClick={handleAddSubtask} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2 mt-2">
            {form.watch("subtasks")?.map((subtask, index) => (
              <div key={subtask.id} className="flex items-center gap-2">
                <div className="bg-muted rounded-md px-3 py-2 text-sm flex-1">{subtask.title}</div>
                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSubtask(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit">{mode === "create" ? "Create Task" : "Update Task"}</Button>
        </div>
      </form>
    </Form>
  )
}
