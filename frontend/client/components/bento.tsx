import type { ReactNode } from "react"
import { ArrowRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  return <div className={cn("grid w-full auto-rows-[22rem] grid-cols-3 gap-4", className)}>{children}</div>
}

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  name: string
  className: string
  background: ReactNode
  Icon: React.ElementType
  description: string
  href: string
  cta: string
}) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
      // Updated styling to match the page theme
      "bg-gradient-to-br from-[#1F2A3C]/40 to-[#0C0C0C]/60 backdrop-blur-sm",
      "border border-[#B0B8C1]/20",
      "hover:border-[#637089]/40 transition-all duration-300",
      "[box-shadow:0_0_0_1px_rgba(176,184,193,.1)]",
      "hover:[box-shadow:0_0_0_1px_rgba(99,112,137,.3)]",
      className,
    )}
  >
    <div className="relative z-10 flex flex-col justify-between h-full p-6">
      <div className="flex flex-col">
        <div className="mb-4">
          <Icon className="h-8 w-8 text-[#637089]" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{name}</h3>
        <p className="text-[#D1D5DB] text-sm leading-relaxed">{description}</p>
      </div>

      <div className="mt-6">
        <Button
          variant="ghost"
          size="sm"
          className="group/button text-[#637089] hover:text-white hover:bg-[#637089]/20 p-0 h-auto font-medium"
          asChild
        >
          <a href={href}>
            {cta}
            <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover/button:translate-x-1" />
          </a>
        </Button>
      </div>
    </div>

    {/* Background decoration */}
    <div className="absolute inset-0 z-0">{background}</div>

    {/* Subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C]/20 to-transparent z-[1]" />
  </div>
)

export { BentoCard, BentoGrid }
