"use client"

import { useState, useCallback } from "react"

/**
 * Custom hook to manage persistent error state that doesn't clear on input changes
 * @param initialError Initial error state
 * @returns Object containing error state and functions to manage it
 */
export function usePersistentError(initialError: string | null = null) {
  const [error, setError] = useState<string | null>(initialError)

  // Set error message
  const setErrorMessage = useCallback((message: string | null) => {
    setError(message)
  }, [])

  // Clear error only when explicitly called
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    setErrorMessage,
    clearError,
  }
}

export default usePersistentError
