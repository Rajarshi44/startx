import { ModernButton } from "@/components/ui/modern-button"
import { DisplayXL, BodyLarge } from "@/components/ui/typography"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-highlight/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-6xl mx-auto">
        {/* Badge */}
        <Badge className="mb-8 bg-highlight/20 text-highlight border-highlight/30 px-6 py-2 text-base font-medium">
          <Sparkles className="w-4 h-4 mr-2" />
          AI-Powered Startup Ecosystem
        </Badge>

        {/* Main Heading */}
        <DisplayXL className="mb-8 text-balance">
          Build, Connect, and <span className="gradient-text">Scale</span> Your Startup Journey
        </DisplayXL>

        {/* Subheading */}
        <BodyLarge className="mb-12 max-w-4xl mx-auto text-balance">
          The all-in-one platform that validates your ideas, connects you with co-founders and investors, and helps you
          build the next big thing with AI-powered insights.
        </BodyLarge>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <ModernButton size="xl" asChild>
            <Link href="/onboarding">
              Get Started Free
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </ModernButton>
          <ModernButton variant="outline" size="xl">
            Watch Demo
          </ModernButton>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { number: "10K+", label: "Startups Validated" },
            { number: "5K+", label: "Connections Made" },
            { number: "$50M+", label: "Funding Raised" },
            { number: "95%", label: "Success Rate" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.number}</div>
              <div className="text-text/60 text-sm md:text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
