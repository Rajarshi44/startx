"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb, Users, TrendingUp } from "lucide-react"

interface StepNavigationProps {
  activeStep: string
  setActiveStep: (step: string) => void
}

export function StepNavigation({ activeStep, setActiveStep }: StepNavigationProps) {
  const steps = [
    {
      id: "idea",
      number: "01",
      title: "Validate Idea",
      description: "Research and validate your startup concept",
      icon: Lightbulb,
    },
    {
      id: "team",
      number: "02",
      title: "Build Team",
      description: "Find co-founders and hire talent",
      icon: Users,
    },
    {
      id: "funding",
      number: "03",
      title: "Secure Funding",
      description: "Connect with investors and create pitch",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-light text-white tracking-wide">Build Your Startup</h2>
        <div className="text-sm text-gray-400 font-light">Complete each step at your own pace</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {steps.map((step, index) => (
          <Card
            key={step.id}
            className={`group cursor-pointer border rounded-2xl transition-all duration-500 hover:scale-[1.02] ${
              activeStep === step.id
                ? "border-amber-400/60 bg-gradient-to-br from-amber-500/10 to-amber-600/5 shadow-2xl shadow-amber-500/20"
                : "border-gray-700/50 bg-black/40 hover:border-amber-500/30"
            }`}
            onClick={() => setActiveStep(step.id)}
          >
            <CardContent className="p-8 text-center">
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                  activeStep === step.id
                    ? "bg-gradient-to-br from-amber-400 to-amber-500 text-black"
                    : "bg-gray-800/50 text-gray-400 group-hover:bg-amber-500/20 group-hover:text-amber-400"
                }`}
              >
                <step.icon className="h-8 w-8" />
              </div>
              <div
                className={`text-3xl font-light mb-2 transition-colors duration-300 ${
                  activeStep === step.id ? "text-amber-400" : "text-gray-500 group-hover:text-amber-400"
                }`}
              >
                {step.number}
              </div>
              <h3
                className={`text-lg font-light mb-2 transition-colors duration-300 ${
                  activeStep === step.id ? "text-white" : "text-gray-300 group-hover:text-white"
                }`}
              >
                {step.title}
              </h3>
              <p className="text-sm text-gray-400 font-light leading-relaxed">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
