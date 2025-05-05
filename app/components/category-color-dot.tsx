"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface CategoryColorDotProps {
  color: string
  className?: string
}

export function CategoryColorDot({ color, className }: CategoryColorDotProps) {
  const dotRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (dotRef.current) {
      dotRef.current.style.backgroundColor = color
    }
  }, [color])

  return <span ref={dotRef} className={cn("rounded-full", className)} aria-hidden="true" />
}
