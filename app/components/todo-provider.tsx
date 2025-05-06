"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useRef } from "react"
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

  // Add this at the top of the component, after the state declarations:
  const tasksLoadedRef = useRef(false)

  // Add this function at the beginning of the TodoProvider component
  const debugLocalStorage = () => {
    console.log("[DEBUG] ===== localStorage Debug Info =====")
    console.log("[DEBUG] localStorage available:", typeof window !== "undefined" && !!window.localStorage)

    if (typeof window !== "undefined" && window.localStorage) {
      console.log("[DEBUG] localStorage keys:", Object.keys(localStorage))
      console.log("[DEBUG] todos in localStorage:", localStorage.getItem("todos"))
      console.log("[DEBUG] categories in localStorage:", localStorage.getItem("categories"))
      console.log("[DEBUG] user in localStorage:", localStorage.getItem("user"))
    }

    console.log("[DEBUG] ===== End localStorage Debug Info =====")
  }

  // Add this useEffect at the beginning of the component
  useEffect(() => {
    debugLocalStorage()

    // Set up an interval to check localStorage periodically
    const interval = setInterval(() => {
      console.log("[DEBUG] Periodic localStorage check:")
      debugLocalStorage()
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [])

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

  // Then replace the useEffect with:
  useEffect(() => {
    if (user && !tasksLoadedRef.current) {
      console.log(`[DEBUG] Loading tasks for user ${user.id}, user object:`, user)

      try {
        // Check if localStorage is available
        if (typeof window === "undefined" || !window.localStorage) {
          console.error("[DEBUG] localStorage is not available in this environment")
          toast({
            title: "Storage Error",
            description: "Your browser storage is not available. Tasks may not be saved.",
            variant: "destructive",
          })
          return
        }

        // Log all localStorage keys for debugging
        console.log("[DEBUG] All localStorage keys:", Object.keys(localStorage))

        const storedTasks = localStorage.getItem("todos")
        console.log("[DEBUG] Raw stored tasks:", storedTasks)

        if (storedTasks) {
          try {
            const parsedTasks = JSON.parse(storedTasks)
            console.log("[DEBUG] Parsed tasks:", parsedTasks)

            // Filter tasks for current user
            const userTasks = Array.isArray(parsedTasks)
              ? parsedTasks.filter((task: Task) => task.userId === user.id)
              : []

            console.log(`[DEBUG] Filtered ${userTasks.length} tasks for user ${user.id}:`, userTasks)

            // Only update state if we have tasks
            if (userTasks.length > 0) {
              setTasks(userTasks)
              setFilteredTasks(userTasks)
              tasksLoadedRef.current = true
            }
          } catch (error) {
            console.error("[DEBUG] Error parsing stored tasks:", error)
            toast({
              title: "Error loading tasks",
              description: "There was a problem loading your tasks. Please try refreshing the page.",
              variant: "destructive",
            })
          }
        } else {
          console.log("[DEBUG] No tasks found in localStorage")
          tasksLoadedRef.current = true // Mark as loaded even if no tasks found
        }
      } catch (error) {
        console.error("[DEBUG] Error accessing localStorage:", error)
        toast({
          title: "Storage Error",
          description: "There was a problem accessing your browser storage.",
          variant: "destructive",
        })
      }
    } else if (!user) {
      console.log("[DEBUG] User not authenticated, skipping task loading")
      tasksLoadedRef.current = false // Reset when user logs out
    }
  }, [user, toast])

  // Save tasks to localStorage
  useEffect(() => {
    if (!user) {
      console.log("[DEBUG] No user, skipping task save")
      return
    }

    console.log(`[DEBUG] Saving tasks for user ${user.id}, tasks:`, tasks)

    try {
      // Get existing tasks from localStorage
      const existingTasksJSON = localStorage.getItem("todos")
      let allTasks: Task[] = []

      if (existingTasksJSON) {
        try {
          // Parse existing tasks
          const existingTasks = JSON.parse(existingTasksJSON)
          console.log("[DEBUG] Existing tasks from localStorage:", existingTasks)

          if (Array.isArray(existingTasks)) {
            // Filter out tasks for the current user (we'll replace them)
            allTasks = existingTasks.filter((task: Task) => task.userId !== user.id)
            console.log(`[DEBUG] Filtered out tasks for user ${user.id}, remaining:`, allTasks)
          } else {
            console.error("[DEBUG] Existing tasks is not an array:", existingTasks)
          }
        } catch (error) {
          console.error("[DEBUG] Error parsing existing tasks:", error)
          // If we can't parse existing tasks, we'll just use the current user's tasks
        }
      }

      // Add current user's tasks
      allTasks = [...allTasks, ...tasks]
      console.log(`[DEBUG] Final tasks to save (${allTasks.length}):`, allTasks)

      // Save to localStorage
      localStorage.setItem("todos", JSON.stringify(allTasks))

      // Verify the save worked
      const verifyTasks = localStorage.getItem("todos")
      console.log("[DEBUG] Verification - saved tasks:", verifyTasks)
    } catch (error) {
      console.error("[DEBUG] Error saving tasks to localStorage:", error)
      toast({
        title: "Error saving tasks",
        description: "Your tasks couldn't be saved. Please try again or check browser storage settings.",
        variant: "destructive",
      })
    }
  }, [tasks, user, toast])

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
      console.log("[DEBUG] Attempted to add task without user")
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

    console.log(`[DEBUG] Adding new task for user ${user.id}:`, newTask)

    // Update state with the new task
    setTasks((prev) => {
      const updatedTasks = [newTask, ...prev]
      console.log("[DEBUG] Updated tasks state:", updatedTasks)

      // Immediately save to localStorage
      try {
        // Get existing tasks
        const existingTasksJSON = localStorage.getItem("todos")
        let allTasks: Task[] = []

        if (existingTasksJSON) {
          try {
            const existingTasks = JSON.parse(existingTasksJSON)
            if (Array.isArray(existingTasks)) {
              // Filter out current user's tasks
              allTasks = existingTasks.filter((t: Task) => t.userId !== user.id)
            }
          } catch (error) {
            console.error("[DEBUG] Error parsing existing tasks during add:", error)
          }
        }

        // Add all tasks including the new one
        allTasks = [...allTasks, ...updatedTasks]
        console.log("[DEBUG] Saving all tasks after add:", allTasks)

        localStorage.setItem("todos", JSON.stringify(allTasks))

        // Verify the save
        const verifyTasks = localStorage.getItem("todos")
        console.log("[DEBUG] Verification after add - saved tasks:", verifyTasks)
      } catch (error) {
        console.error("[DEBUG] Failed to save tasks after adding:", error)
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
