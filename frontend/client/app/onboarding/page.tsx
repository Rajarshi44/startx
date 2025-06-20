"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Lightbulb, Users, TrendingUp, ArrowRight, ArrowLeft, Sparkles, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser, UserButton } from "@civic/auth/react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

const userTypes = [
  {
    id: "founder",
    title: "Startup Founder",
    description: "I have an idea and want to build a startup",
    icon: Lightbulb,
    gradient: "from-purple-500/20 to-pink-500/20",
    features: ["Idea validation", "Co-founder matching", "Investor connections", "Pitch deck creation"],
  },
  {
    id: "jobseeker",
    title: "Job Seeker",
    description: "I want to find opportunities in startups",
    icon: Users,
    gradient: "from-blue-500/20 to-cyan-500/20",
    features: ["Role matching", "Interview practice", "Startup insights", "Career guidance"],
  },
  {
    id: "investor",
    title: "Investor",
    description: "I want to discover and invest in startups",
    icon: TrendingUp,
    gradient: "from-green-500/20 to-emerald-500/20",
    features: ["Deal flow", "Analytics", "Pitch reviews", "Portfolio tracking"],
  },
]

export default function OnboardingPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user: civicUser, signOut } = useUser()

  useEffect(() => {
    const type = searchParams.get("type")
    if (type && userTypes.find((t) => t.id === type)) {
      setSelectedType(type)
    }

    // Check if user is authenticated and get their current data
    if (civicUser) {
      checkUser()
    }
  }, [searchParams, civicUser])

  const checkUser = async () => {
    if (!civicUser?.id) return

    try {
      const response = await fetch(`/api/user/profile?civicId=${civicUser.id}`)
      const data = await response.json()

      if (response.ok) {
        setUser(data.user)

        // If user is already onboarded, redirect to their dashboard
        if (data.user.onboarded && data.user.role) {
          router.push(`/dashboard/${data.user.role}`)
        }
      } else if (response.status === 404) {
        // User not found in database, that's ok - they can still select a role
        console.log("User not found in database, will be created on role selection")
      }
    } catch (error) {
      console.error("Error checking user:", error)
      toast({
        title: "Error",
        description: "There was an error loading your profile.",
        variant: "destructive",
      })
    }
  }

  const handleContinue = async () => {
    if (selectedType && !isLoading && civicUser?.id) {
      setIsLoading(true)

      try {
        const response = await fetch("/api/user/update-role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: selectedType,
            civicId: civicUser.id,
            email: civicUser.email,
            name: civicUser.name || civicUser.username,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          toast({
            title: "Welcome aboard!",
            description: "Your profile has been set up successfully.",
          })

          // Redirect to appropriate dashboard
          router.push(`/dashboard/${selectedType}`)
        } else {
          throw new Error(data.error || "Failed to update profile")
        }
      } catch (error) {
        console.error("Error updating user role:", error)
        toast({
          title: "Error",
          description: "There was an error setting up your profile. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black" style={{ color: "#f6f6f6" }}>
      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="p-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
            <span style={{ color: "#f6f6f6" }}>Startup</span>
            <span style={{ color: "#ffcb74" }}>Hub</span>
          </Link>

          {/* Civic Auth Integration */}
          {civicUser ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <UserButton />
                <span className="text-sm" style={{ color: "#ffcb74" }}>
                  Welcome, {civicUser.username || "User"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="bg-transparent border-[#ffcb74] text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="bg-transparent border-[#ffcb74] text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300"
              onClick={() => router.push("/auth")}
            >
              Sign In
            </Button>
          )}
        </nav>

        {/* Main Onboarding Content - Left Aligned */}
        <main className="flex-1 flex items-center px-6 lg:px-12">
          <div className="max-w-5xl w-full">
            {/* Header */}
            <div className="mb-16">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm mb-8"
                style={{
                  borderColor: "rgba(255, 203, 116, 0.3)",
                  backgroundColor: "rgba(255, 203, 116, 0.1)",
                  color: "#ffcb74",
                }}
              >
                <Sparkles className="w-4 h-4" />
                Choose Your Journey
              </div>
              <h1 className="text-6xl lg:text-8xl font-bold mb-8 leading-tight">
                What's Your{" "}
                <span
                  className="text-transparent bg-clip-text bg-gradient-to-r"
                  style={{
                    backgroundImage: "linear-gradient(to right, #ffcb74, #ffd700)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Role?
                </span>
              </h1>
              <p className="max-w-3xl text-xl lg:text-2xl text-gray-300 leading-relaxed mb-12">
                Select the path that best describes your goals and we'll customize your experience with{" "}
                <span className="font-semibold" style={{ color: "#ffcb74" }}>
                  AI-powered tools
                </span>{" "}
                tailored just for you.
              </p>
            </div>

            {/* User Type Selection */}
            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {userTypes.map((type) => {
                const Icon = type.icon
                const isSelected = selectedType === type.id
                return (
                  <div
                    key={type.id}
                    className={`cursor-pointer transition-all duration-300 relative overflow-hidden group backdrop-blur-sm border rounded-xl p-6 hover:border-opacity-60 ${
                      isSelected
                        ? "border-[#ffcb74] bg-[#ffcb74]/10 scale-105 shadow-2xl"
                        : "border-[#ffcb74]/20 bg-white/5 hover:bg-white/10"
                    }`}
                    onClick={() => setSelectedType(type.id)}
                    style={{
                      borderColor: isSelected ? "#ffcb74" : "rgba(255, 203, 116, 0.2)",
                    }}
                  >
                    {/* Icon and Header */}
                    <div className="text-center pb-6">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${
                          isSelected ? "bg-[#ffcb74]/30" : "bg-[#ffcb74]/20 group-hover:bg-[#ffcb74]/30"
                        }`}
                      >
                        <Icon className="h-8 w-8" style={{ color: "#ffcb74" }} />
                      </div>
                      <h3 className="text-2xl font-bold mb-4" style={{ color: "#f6f6f6" }}>
                        {type.title}
                      </h3>
                      <p className="text-gray-300 text-base">{type.description}</p>
                    </div>

                    {/* Features List */}
                    <div className="pt-0">
                      <ul className="space-y-3">
                        {type.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-gray-300">
                            <div
                              className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
                              style={{ backgroundColor: "#ffcb74" }}
                            />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "#ffcb74" }}
                        >
                          <div className="w-2 h-2 rounded-full bg-black"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                size="lg"
                className="text-[#ffcb74] hover:bg-[#ffcb74]/10"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Home
              </Button>

              <Button
                onClick={handleContinue}
                disabled={!selectedType || isLoading}
                size="lg"
                className={`bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] transition-all duration-300 shadow-lg hover:shadow-xl px-10 py-4 text-lg font-semibold ${
                  !selectedType || isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Setting up..." : "Continue"}
                {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-left text-gray-500 text-sm">
          <p>&copy; 2024 StartupHub. Powered by AI. Built for the future.</p>
        </footer>
      </div>
    </div>
  )
}
