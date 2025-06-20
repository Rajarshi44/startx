import { ModernButton } from "@/components/ui/modern-button"
import { DisplayLG, BodyLarge, BodyMedium } from "@/components/ui/typography"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-highlight/10 via-transparent to-blue-500/10" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-highlight/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <Sparkles className="w-16 h-16 text-highlight mx-auto mb-8" />

          <DisplayLG className="mb-8 text-balance">
            Ready to Transform Your <span className="gradient-text">Startup Journey?</span>
          </DisplayLG>

          <BodyLarge className="mb-12 text-balance max-w-3xl mx-auto">
            Join thousands of founders, job seekers, and investors who are already building the future. Start your
            journey today with our AI-powered platform.
          </BodyLarge>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <ModernButton size="xl" asChild>
              <Link href="/onboarding">
                Get Started Today
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </ModernButton>
            <ModernButton variant="outline" size="xl">
              Schedule Demo
            </ModernButton>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-16 border-t border-white/10">
            <BodyMedium className="text-text/60 mb-8">Trusted by innovative companies worldwide</BodyMedium>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
              {["TechCorp", "InnovateLab", "StartupX", "VentureHub", "FutureBuilders"].map((company, index) => (
                <div key={index} className="text-xl font-semibold text-text/40">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
