"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, TrendingUp, Briefcase, MessageCircle } from "lucide-react"
import { useUser } from "@civic/auth/react"

export function FloatingNavbar() {
  const { user } = useUser()
  const pathname = usePathname()

  // Only show if user is signed in and not on the landing page
  if (!user || pathname === "/") {
    return null
  }

  const navItems = [
    {
      href: "/dashboard/founder",
      icon: TrendingUp,
      label: "Founder",
      isActive: pathname.startsWith("/dashboard/founder")
    },
    {
      href: "/dashboard/jobseeker",
      icon: Briefcase,
      label: "Job Seeker", 
      isActive: pathname.startsWith("/dashboard/jobseeker")
    },
    {
      href: "/dashboard/investor", 
      icon: Users,
      label: "Investor",
      isActive: pathname.startsWith("/dashboard/investor")
    },
    
    {
      href: "/community",
      icon: MessageCircle,
      label: "Community",
      isActive: pathname.startsWith("/community")
    }
  ]

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div 
        className="flex items-center gap-4 px-6 py-4 rounded-full backdrop-blur-md border shadow-2xl"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "rgba(255, 203, 116, 0.3)",
          backdropFilter: "blur(20px)",
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative"
            >
              <div
                className={`
                  w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 
                  border-2 hover:scale-110 hover:shadow-lg
                  ${item.isActive 
                    ? 'bg-gradient-to-r from-[#ffcb74] to-[#ffd700] border-[#ffd700] text-black shadow-lg' 
                    : 'bg-transparent border-[#ffcb74] text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black'
                  }
                `}
              >
                <Icon className="w-6 h-6" />
              </div>
              
              {/* Tooltip */}
              <div 
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.9)",
                  borderColor: "rgba(255, 203, 116, 0.3)",
                  color: "#ffcb74",
                  border: "1px solid rgba(255, 203, 116, 0.3)"
                }}
              >
                {item.label}
                <div 
                  className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent", 
                    borderTop: "4px solid rgba(255, 203, 116, 0.3)"
                  }}
                />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
} 