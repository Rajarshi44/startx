"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ModernButton } from "@/components/ui/modern-button"
import { ModernCard } from "@/components/ui/modern-card"
import { DisplayLG, DisplaySM, BodyMedium } from "@/components/ui/typography"
import { Badge } from "@/components/ui/badge"
import { CardContent, CardHeader } from "@/components/ui/card"
import { Lightbulb, Users, TrendingUp, ArrowRight, ArrowLeft } from "lucide-react"

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
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const type = searchParams.get("type")
    if (type && userTypes.find((t) => t.id === type)) {
      setSelectedType(type)
    }
  }, [searchParams])

  const handleContinue = () => {
    if (selectedType) {
      router.push(`/dashboard/${selectedType}`)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-6 py-20">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-highlight/20 text-highlight border-highlight/30 px-4 py-2">Step 1 of 3</Badge>
          <DisplayLG className="mb-6">Choose Your Journey</DisplayLG>
          <BodyMedium className="max-w-3xl mx-auto text-xl text-text/70">
            Select the path that best describes your goals and we'll customize your experience
          </BodyMedium>
        </div>

        {/* User Type Selection */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {userTypes.map((type) => {
            const Icon = type.icon
            const isSelected = selectedType === type.id

            return (
              <ModernCard
                key={type.id}
                variant="elevated"
                hover
                className={`cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                  isSelected ? "ring-2 ring-highlight shadow-2xl scale-105" : ""
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-0 group-hover:opacity-100 ${isSelected ? "opacity-100" : ""} transition-opacity duration-500`}
                />

                <CardHeader className="relative z-10 text-center pb-6">
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${
                      isSelected ? "bg-highlight/30" : "bg-highlight/20 group-hover:bg-highlight/30"
                    }`}
                  >
                    <Icon className="h-10 w-10 text-highlight" />
                  </div>
                  <DisplaySM className="mb-4">{type.title}</DisplaySM>
                  <BodyMedium className="text-text/70">{type.description}</BodyMedium>
                </CardHeader>

                <CardContent className="relative z-10 pt-0">
                  <ul className="space-y-4">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-text/80">
                        <div className="w-2 h-2 bg-highlight rounded-full mr-4 flex-shrink-0" />
                        <span className="text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </ModernCard>
            )
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <ModernButton variant="ghost" onClick={() => router.push("/")} size="lg">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Home
          </ModernButton>

          <ModernButton
            onClick={handleContinue}
            disabled={!selectedType}
            size="lg"
            className={!selectedType ? "opacity-50 cursor-not-allowed" : ""}
          >
            Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </ModernButton>
        </div>
      </div>
    </div>
  )
}
