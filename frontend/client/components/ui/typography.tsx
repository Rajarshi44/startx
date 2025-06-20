import type React from "react"
import { cn } from "@/lib/utils"

interface TypographyProps {
  children: React.ReactNode
  className?: string
}

export function DisplayXL({ children, className }: TypographyProps) {
  return <h1 className={cn("text-display-xl font-bold tracking-tight", className)}>{children}</h1>
}

export function DisplayLG({ children, className }: TypographyProps) {
  return <h1 className={cn("text-display-lg font-bold tracking-tight", className)}>{children}</h1>
}

export function DisplayMD({ children, className }: TypographyProps) {
  return <h2 className={cn("text-display-md font-semibold tracking-tight", className)}>{children}</h2>
}

export function DisplaySM({ children, className }: TypographyProps) {
  return <h3 className={cn("text-display-sm font-semibold tracking-tight", className)}>{children}</h3>
}

export function BodyLarge({ children, className }: TypographyProps) {
  return <p className={cn("text-xl leading-relaxed text-text/80", className)}>{children}</p>
}

export function BodyMedium({ children, className }: TypographyProps) {
  return <p className={cn("text-base leading-relaxed text-text/70", className)}>{children}</p>
}
