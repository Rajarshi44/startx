import { ModernCard } from "@/components/ui/modern-card"
import { DisplayMD, DisplaySM, BodyMedium } from "@/components/ui/typography"
import { CardContent } from "@/components/ui/card"
import { Target, Users, Zap, BarChart3, Shield, Rocket } from "lucide-react"

const features = [
  {
    icon: Target,
    title: "AI Idea Validation",
    description:
      "Get instant feedback on your startup idea with comprehensive market analysis, competitor research, and SWOT evaluation powered by advanced AI.",
  },
  {
    icon: Users,
    title: "Smart Matching",
    description:
      "Connect with compatible co-founders, team members, and investors using our proprietary AI compatibility scoring algorithm.",
  },
  {
    icon: Zap,
    title: "Interview Simulation",
    description:
      "Practice with AI-powered interview simulations that provide real-time feedback, skill assessment, and personalized improvement recommendations.",
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    description:
      "Leverage data-driven insights to make informed decisions about investments, hiring, and strategic partnerships.",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description:
      "Enterprise-grade security with end-to-end encryption, ensuring your sensitive business information stays protected.",
  },
  {
    icon: Rocket,
    title: "Growth Acceleration",
    description:
      "Access curated resources, mentorship programs, and growth hacking tools to accelerate your startup journey.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-32 px-6 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-highlight/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <DisplayMD className="mb-6">Powered by AI, Built for Success</DisplayMD>
          <BodyMedium className="max-w-3xl mx-auto text-xl">
            Our platform combines cutting-edge artificial intelligence with proven startup methodologies to accelerate
            your journey from idea to success.
          </BodyMedium>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <ModernCard key={index} variant="glass" hover className="group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-highlight/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-highlight/30 transition-colors duration-300">
                    <Icon className="h-8 w-8 text-highlight" />
                  </div>
                  <DisplaySM className="mb-4 text-xl">{feature.title}</DisplaySM>
                  <BodyMedium className="text-text/70 leading-relaxed">{feature.description}</BodyMedium>
                </CardContent>
              </ModernCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
