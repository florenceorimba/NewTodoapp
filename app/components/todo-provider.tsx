"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "../components/auth-provider"
import { generateId } from "@/lib/utils"
import { useToast } from "../components/toast-provider"

export type Priority = "low" | "medium" | "high"

export type Category = {
  id: string
  name: string
  color: string
  count?: number
}

export type SubTask = {
  id: string
  title: string
  completed: boolean
}

export type Task = {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
  dueDate?: string
  priority: Priority
  categoryId?: string
  userId: string
  subtasks?: SubTask[]
}

export type TaskFilters = {
  status?: "all" | "active" | "completed"
  priority?: Priority | "all"
  categoryId?: string | "all"
  dueDate?: "today" | "week" | "month" | "all"
  searchQuery?: string
}

type TodoContextType = {
  tasks: Task[]
  filteredTasks: Task[]
  categories: Category[]
  addTask: (task: Omit<Task, "id" | "createdAt" | "userId">) => void
  updateTask: (id: string, task: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTaskCompletion: (id: string) => void
  addCategory: (category: Omit<Category, "id">) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  deleteCategory: (id: string) => void
  addSubtask: (taskId: string, title: string) => void
  updateSubtask: (taskId: string, subtaskId: string, completed: boolean) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void
  filterTasks: (filters: Partial<TaskFilters>) => void
  searchTasks: (query: string) => void
  exportTasks: () => string
  importTasks: (data: string) => void
  activeFilters: TaskFilters
  clearFilters: () => void
}

const TodoContext = createContext<TodoContextType | undefined>(undefined)

const defaultCategories: Category[] = [
  { id: "cat-1", name: "Work", color: "#4f46e5" },
  { id: "cat-2", name: "Personal", color: "#10b981" },
  { id: "cat-3", name: "Shopping", color: "#f59e0b" },
  { id: "cat-4", name: "Health", color: "#ef4444" },
]

// Define default filters with correct type literals
const defaultTaskFilters: TaskFilters = {
  status: "all",
  priority: "all",
  categoryId: "all",
  dueDate: "all",
  searchQuery: "",
}

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [activeFilters, setActiveFilters] = useState<TaskFilters>(defaultTaskFilters)

  useEffect(() => {
    // Define checkLocalStorage inside the effect
    const checkLocalStorage = () => {
      try {
        const testKey = "todoapp-test"
        localStorage.setItem(testKey, "test")
        const testValue = localStorage.getItem(testKey)
        localStorage.removeItem(testKey)

        if (testValue !== "test") {
          console.error("localStorage is not working properly")
          toast({
            title: "Storage Error",
            description: "Your browser storage is not working properly. Tasks may not be saved.",
            variant: "destructive",
          })
          return false
        }
        return true
      } catch (error) {
        console.error("localStorage is not available:", error)
        toast({
          title: "Storage Error",
          description: "Your browser storage is not available. Tasks may not be saved.",
          variant: "destructive",
        })
        return false
      }
    }

    // Call the function
    checkLocalStorage()
  }, [toast]) // Add toast as a dependency

  // Load tasks and categories from localStorage
  useEffect(() => {
    if (user) {
      const storedTasks = localStorage.getItem("todos")
      console.log("Loading tasks from localStorage:", storedTasks)

      if (storedTasks) {
        try {
          const parsedTasks = JSON.parse(storedTasks)
          console.log("Parsed tasks:", parsedTasks)

          // Filter tasks for current user
          const userTasks = parsedTasks.filter((task: Task) => task.userId === user.id)
          console.log("User ID:", user.id, "Filtered tasks:", userTasks)

          setTasks(userTasks)
          setFilteredTasks(userTasks)
        } catch (error) {
          console.error("Error parsing stored tasks:", error)
        }
      } else {
        console.log("No tasks found in localStorage")
      }

      const storedCategories = localStorage.getItem("categories")
      if (storedCategories) {
        try {
          setCategories(JSON.parse(storedCategories))
        } catch (error) {
          console.error("Error parsing stored categories:", error)
        }
      }
    } else {
      console.log("User not authenticated, skipping task loading")
    }
  }, [user])

  // Save tasks and categories to localStorage
  useEffect(() => {
    try {
      // Only save if there are tasks to save
      if (tasks.length > 0) {
        console.log("Saving tasks to localStorage:", tasks)
        localStorage.setItem("todos", JSON.stringify(tasks))
      }
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error)
      // Attempt to notify the user of the error
      if (toast) {
        toast({
          title: "Error saving tasks",
          description: "Your tasks couldn't be saved. Please try again or check browser storage settings.",
          variant: "destructive",
        })
      }
    }
  }, [tasks, toast])

  useEffect(() => {
    // Save categories even if user is not logged in
    localStorage.setItem("categories", JSON.stringify(categories))
  }, [categories])

  // Update category counts
  useEffect(() => {
    // Use functional update to avoid dependency on categories
    setCategories((prevCategories) => {
      // Skip the update if there are no categories
      if (prevCategories.length === 0) return prevCategories

      return prevCategories.map((category) => {
        const count = tasks.filter((task) => task.categoryId === category.id).length
        return { ...category, count }
      })
    })
  }, [tasks]) // Only depend on tasks

  const addTask = (task: Omit<Task, "id" | "createdAt" | "userId">) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to add tasks.",
        variant: "destructive",
      })
      return
    }

    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString(),
      userId: user.id,
    }

    console.log("Adding new task with user ID:", user.id, newTask)

    setTasks((prev) => {
      const updatedTasks = [newTask, ...prev]
      // Immediately try to save to localStorage for extra safety
      try {
        localStorage.setItem("todos", JSON.stringify(updatedTasks))
      } catch (error) {
        console.error("Failed to save tasks after adding:", error)
      }
      return updatedTasks
    })

    applyFilters({ ...activeFilters }, [newTask, ...tasks])

    toast({
      title: "Task added",
      description: "Your task has been added successfully.",
      variant: "success",
    })
  }

  const updateTask = (id: string, updatedFields: Partial<Task>) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updatedFields } : task)))

    const updatedTasks = tasks.map((task) => (task.id === id ? { ...task, ...updatedFields } : task))

    applyFilters({ ...activeFilters }, updatedTasks)

    toast({
      title: "Task updated",
      description: "Your task has been updated successfully.",
      variant: "success",
    })
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))

    const updatedTasks = tasks.filter((task) => task.id !== id)
    applyFilters({ ...activeFilters }, updatedTasks)

    toast({
      title: "Task deleted",
      description: "Your task has been deleted.",
      variant: "success",
    })
  }

  const toggleTaskCompletion = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))

    const updatedTasks = tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))

    applyFilters({ ...activeFilters }, updatedTasks)
  }

  const addCategory = (category: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...category,
      id: generateId(),
    }

    setCategories((prev) => [...prev, newCategory])

    toast({
      title: "Category added",
      description: "Your category has been added successfully.",
      variant: "success",
    })
  }

  const updateCategory = (id: string, updatedFields: Partial<Category>) => {
    setCategories((prev) => prev.map((category) => (category.id === id ? { ...category, ...updatedFields } : category)))

    toast({
      title: "Category updated",
      description: "Your category has been updated successfully.",
      variant: "success",
    })
  }

  const deleteCategory = (id: string) => {
    // Update tasks that use this category
    setTasks((prev) => prev.map((task) => (task.categoryId === id ? { ...task, categoryId: undefined } : task)))

    setCategories((prev) => prev.filter((category) => category.id !== id))

    toast({
      title: "Category deleted",
      description: "Your category has been deleted.",
      variant: "success",
    })
  }

  const addSubtask = (taskId: string, title: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const subtasks = task.subtasks || []
          return {
            ...task,
            subtasks: [...subtasks, { id: generateId(), title, completed: false }],
          }
        }
        return task
      }),
    )
  }

  const updateSubtask = (taskId: string, subtaskId: string, completed: boolean) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId && task.subtasks) {
          return {
            ...task,
            subtasks: task.subtasks.map((subtask) => (subtask.id === subtaskId ? { ...subtask, completed } : subtask)),
          }
        }
        return task
      }),
    )
  }

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId && task.subtasks) {
          return {
            ...task,
            subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId),
          }
        }
        return task
      }),
    )
  }

  const applyFilters = (filters: TaskFilters, taskList: Task[] = tasks) => {
    let result = [...taskList]

    // Filter by status
    if (filters.status && filters.status !== "all") {
      result = result.filter((task) => (filters.status === "completed" ? task.completed : !task.completed))
    }

    // Filter by priority
    if (filters.priority && filters.priority !== "all") {
      result = result.filter((task) => task.priority === filters.priority)
    }

    // Filter by category
    if (filters.categoryId && filters.categoryId !== "all") {
      result = result.filter((task) => task.categoryId === filters.categoryId)
    }

    // Filter by due date
    if (filters.dueDate && filters.dueDate !== "all") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(today)
      endOfWeek.setDate(today.getDate() + (7 - today.getDay()))

      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      result = result.filter((task) => {
        if (!task.dueDate) return false

        const dueDate = new Date(task.dueDate)
        dueDate.setHours(0, 0, 0, 0)

        if (filters.dueDate === "today") {
          return dueDate.getTime() === today.getTime()
        } else if (filters.dueDate === "week") {
          return dueDate >= today && dueDate <= endOfWeek
        } else if (filters.dueDate === "month") {
          return dueDate >= today && dueDate <= endOfMonth
        }

        return true
      })
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)),
      )
    }

    setFilteredTasks(result)
    setActiveFilters(filters)
  }

  const filterTasks = (filters: Partial<TaskFilters>) => {
    applyFilters({ ...activeFilters, ...filters })
  }

  const searchTasks = (query: string) => {
    applyFilters({ ...activeFilters, searchQuery: query })
  }

  const clearFilters = () => {
    // Use the predefined defaultTaskFilters constant
    applyFilters(defaultTaskFilters)
  }

  const exportTasks = () => {
    const data = {
      tasks,
      categories,
    }
    return JSON.stringify(data)
  }

  const importTasks = (data: string) => {
    try {
      const parsedData = JSON.parse(data)

      if (parsedData.tasks && Array.isArray(parsedData.tasks)) {
        // Ensure all imported tasks belong to current user
        const importedTasks = parsedData.tasks.map((task: Task) => ({
          ...task,
          userId: user?.id || task.userId,
        }))

        setTasks(importedTasks)
        setFilteredTasks(importedTasks)
      }

      if (parsedData.categories && Array.isArray(parsedData.categories)) {
        setCategories(parsedData.categories)
      }

      toast({
        title: "Import successful",
        description: "Your tasks and categories have been imported.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error importing data:", error)
      toast({
        title: "Import failed",
        description: "There was an error importing your data. Please check the format.",
        variant: "destructive",
      })
    }
  }

  return (
    <TodoContext.Provider
      value={{
        tasks,
        filteredTasks,
        categories,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubtask,
        updateSubtask,
        deleteSubtask,
        filterTasks,
        searchTasks,
        exportTasks,
        importTasks,
        activeFilters,
        clearFilters,
      }}
    >
      {children}
    </TodoContext.Provider>
  )
}

export function useTodoContext() {
  const context = useContext(TodoContext)
  if (context === undefined) {
    throw new Error("useTodoContext must be used within a TodoProvider")
  }
  return context
}
