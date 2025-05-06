"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useRef } from "react"

type User = {
  id: string
  name: string
  email: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add a ref to track if we should allow clearing errors
  const allowClearErrorRef = useRef(false)

  // Add this debugging function at the beginning of the AuthProvider component
  const debugAuthState = (message: string) => {
    console.log(`[AUTH DEBUG] ${message}`)
    console.log("[AUTH DEBUG] Current user:", user)
    console.log("[AUTH DEBUG] isLoading:", isLoading)
    console.log("[AUTH DEBUG] error:", error)

    // Check localStorage
    if (typeof window !== "undefined" && window.localStorage) {
      console.log("[AUTH DEBUG] user in localStorage:", localStorage.getItem("user"))
    }
  }

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        // Handle potential JSON parse error
        console.error("Failed to parse stored user data:", e)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  // Add this useEffect after the existing useEffect for loading user
  useEffect(() => {
    // Define the function inside the effect
    const debugAuthState = (message: string) => {
      console.log(`[AUTH DEBUG] ${message}`)
      console.log("[AUTH DEBUG] Current user:", user)
      console.log("[AUTH DEBUG] isLoading:", isLoading)
      console.log("[AUTH DEBUG] error:", error)

      // Check localStorage
      if (typeof window !== "undefined" && window.localStorage) {
        console.log("[AUTH DEBUG] user in localStorage:", localStorage.getItem("user"))
      }
    }

    // Call it
    debugAuthState("Auth state changed")
  }, [user, isLoading, error])

  const clearError = () => {
    // Only clear error if explicitly allowed
    if (allowClearErrorRef.current) {
      console.log("Clearing error state (allowed)")
      setError(null)
      allowClearErrorRef.current = false
    } else {
      console.log("Clearing error state prevented - not allowed")
    }
  }

  // Replace the login function with this improved version
  const login = async (email: string, password: string): Promise<boolean> => {
    debugAuthState("Login attempt started")
    setIsLoading(true)

    // Add a small delay to simulate network request
    await new Promise((resolve) => setTimeout(resolve, 600))

    // Only allow the specific user to login
    if (email === "testingtodo@gmail.com" && password === "123456") {
      // Allow clearing errors on successful login
      allowClearErrorRef.current = true

      // Clear error on successful login
      setError(null)

      // Create the authorized user
      const authorizedUser = {
        id: "user-1",
        name: "Todo Tester",
        email: "testingtodo@gmail.com",
      }

      console.log("[AUTH DEBUG] Login successful, setting user:", authorizedUser)

      setUser(authorizedUser)

      // Save user to localStorage with explicit error handling
      try {
        localStorage.setItem("user", JSON.stringify(authorizedUser))
        console.log("[AUTH DEBUG] User saved to localStorage")

        // Verify the save
        const savedUser = localStorage.getItem("user")
        console.log("[AUTH DEBUG] Verification - saved user:", savedUser)
      } catch (error) {
        console.error("[AUTH DEBUG] Error saving user to localStorage:", error)
      }

      setIsLoading(false)
      debugAuthState("Login completed successfully")
      return true // Successful login
    } else {
      // Set error message for invalid credentials with more specific feedback
      const errorMessage =
        email !== "testingtodo@gmail.com"
          ? "Invalid email address. Please try testingtodo@gmail.com"
          : "Invalid password. Please try again."

      console.log("[AUTH DEBUG] Login failed, setting error:", errorMessage)

      // Set the error state
      setError(errorMessage)

      // Important: We need to set isLoading to false AFTER setting the error
      setIsLoading(false)

      debugAuthState("Login failed")
      // Return false to indicate login failure
      return false
    }
  }

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    // Don't clear previous errors here

    // Add a small delay to simulate network request
    await new Promise((resolve) => setTimeout(resolve, 600))

    // Only allow signup with the specific email
    if (email === "testingtodo@gmail.com" && password === "123456") {
      // Allow clearing errors on successful signup
      allowClearErrorRef.current = true

      // Clear error on successful signup
      setError(null)

      const authorizedUser = {
        id: "user-1",
        name: name || "Todo Tester",
        email: "testingtodo@gmail.com",
      }

      setUser(authorizedUser)
      localStorage.setItem("user", JSON.stringify(authorizedUser))
      setIsLoading(false)
      return true // Successful signup
    } else {
      // Set error message for invalid signup
      setError("Signup is restricted to authorized users only.")
      setIsLoading(false)
      return false // Failed signup
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)

      // Allow clearing errors on logout
      allowClearErrorRef.current = true

      // Clear user authentication state
      setUser(null)
      setError(null)

      // Only remove the user authentication data, preserve task data
      localStorage.removeItem("user")

      // We intentionally DO NOT remove todos and categories
      // localStorage.removeItem("todos")
      // localStorage.removeItem("categories")

      // Clear any other potential app state in localStorage that's not related to tasks
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith("app-") || key === "sidebar:state")) {
          keysToRemove.push(key)
        }
      }

      // Remove collected keys
      keysToRemove.forEach((key) => localStorage.removeItem(key))

      // Small delay to ensure all state is cleared before any navigation
      await new Promise((resolve) => setTimeout(resolve, 100))

      return Promise.resolve()
    } catch (error) {
      console.error("Logout error:", error)
      return Promise.reject(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Add this after the other useEffect
  useEffect(() => {
    console.log("Auth provider error state changed:", error)
  }, [error])

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
