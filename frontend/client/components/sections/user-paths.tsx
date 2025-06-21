import { ModernCard } from "@/components/ui/modern-card"
import { ModernButton } from "@/components/ui/modern-button"
import { DisplayMD, DisplaySM, BodyMedium } from "@/components/ui/typography"
import { CardContent, CardHeader } from "@/components/ui/card"
import { Lightbulb, Users, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"

const userPaths = [
  {
    id: "founder",
    title: "Startup Founder",
    description: "Validate your idea, find co-founders, and connect with investors",
    icon: Lightbulb,
    color: "from-purple-500/20 to-pink-500/20",
    features: [
      "AI-powered idea validation",
      "Co-founder matching algorithm",
      "Investor introductions",
      "Pitch deck creation tools",
    ],
  },
  {
    id: "jobseeker",
    title: "Job Seeker",
    description: "Find your perfect role in exciting startups",
    icon: Users,
    color: "from-blue-500/20 to-cyan-500/20",
    features: [
      "Smart role matching",
      "AI interview practice",
      "Startup insights & culture",
      "Personalized career guidance",
    ],
  },
  {
    id: "investor",
    title: "Investor",
    description: "Discover and invest in promising startups",
    icon: TrendingUp,
    color: "from-green-500/20 to-emerald-500/20",
    features: ["Curated deal flow", "Predictive analytics", "Interactive pitch reviews", "Portfolio management"],
  },
]

export function UserPathsSection() {
  return (
    <section className="py-32 px-6">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <DisplayMD className="mb-6">Choose Your Path</DisplayMD>
          <BodyMedium className="max-w-3xl mx-auto text-xl">
            Whether you&aptos;re a founder with an idea, looking for opportunities, or ready to invest, we have the perfect
            journey tailored for you.
          </BodyMedium>
        </div>

        {/* Path Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {userPaths.map((path) => {
            const Icon = path.icon
            return (
              <ModernCard key={path.id} variant="elevated" hover className="relative overflow-hidden group">
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${path.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <CardHeader className="relative z-10 text-center pb-6">
                  <div className="w-16 h-16 bg-highlight/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-highlight/30 transition-colors">
                    <Icon className="h-8 w-8 text-highlight" />
                  </div>
                  <DisplaySM className="mb-4">{path.title}</DisplaySM>
                  <BodyMedium className="text-text/70">{path.description}</BodyMedium>
                </CardHeader>

                <CardContent className="relative z-10 pt-0">
                  <ul className="space-y-4 mb-8">
                    {path.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-text/80">
                        <div className="w-2 h-2 bg-highlight rounded-full mt-2 mr-4 flex-shrink-0" />
                        <span className="text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <ModernButton variant="primary" size="lg" className="w-full" asChild>
                    <Link href={`/onboarding?type=${path.id}`}>
                      Start as {path.title.split(" ")[0]}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </ModernButton>
                </CardContent>
              </ModernCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
