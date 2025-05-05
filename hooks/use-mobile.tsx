"use client"

import { useState, useEffect } from "react"

/**
 * Hook to detect if the current device is a mobile device based on screen width
 * @param breakpoint The screen width breakpoint to consider as mobile (default: 768px)
 * @returns Boolean indicating if the current device is considered mobile
 */
export function useMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Set initial value
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Check on mount
    checkScreenSize()

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize)

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("resize", checkScreenSize)
    }
  }, [breakpoint])

  return isMobile
}

export default useMobile
