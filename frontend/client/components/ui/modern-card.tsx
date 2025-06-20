import { cn } from "@/lib/utils"
import { Card, type CardProps } from "@/components/ui/card"
import { forwardRef } from "react"

interface ModernCardProps extends CardProps {
  variant?: "default" | "glass" | "elevated"
  hover?: boolean
}

const ModernCard = forwardRef<HTMLDivElement, ModernCardProps>(
  ({ className, variant = "default", hover = false, children, ...props }, ref) => {
    const baseStyles = "bg-dark border border-white/10 rounded-2xl transition-all duration-300"

    const variants = {
      default: "shadow-lg",
      glass: "glass-effect",
      elevated: "shadow-2xl bg-gradient-to-br from-dark to-secondary/50",
    }

    const hoverStyles = hover ? "hover-lift cursor-pointer" : ""

    return (
      <Card className={cn(baseStyles, variants[variant], hoverStyles, className)} ref={ref} {...props}>
        {children}
      </Card>
    )
  },
)
ModernCard.displayName = "ModernCard"

export { ModernCard }
