import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/button"
import { forwardRef } from "react"

interface ModernButtonProps extends ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "outline"
  size?: "sm" | "md" | "lg" | "xl"
}

const ModernButton = forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "font-medium transition-all duration-300 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-highlight/50"

    const variants = {
      primary: "bg-button text-text hover:bg-button/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5",
      secondary: "bg-secondary text-text hover:bg-secondary/80 shadow-md hover:shadow-lg",
      ghost: "bg-transparent text-text hover:bg-white/10",
      outline: "bg-transparent border border-highlight text-highlight hover:bg-highlight hover:text-button",
    }

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
      xl: "px-10 py-5 text-xl",
    }

    return (
      <Button className={cn(baseStyles, variants[variant], sizes[size], className)} ref={ref} {...props}>
        {children}
      </Button>
    )
  },
)
ModernButton.displayName = "ModernButton"

export { ModernButton }
