"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Users, TrendingUp, ArrowRight, Sparkles, Calendar } from "lucide-react"
import { StaggerTestimonials } from "./marquee-text"
import { AuroraText } from "./aurora-text"
import Link from "next/link"
import { BentoCard, BentoGrid } from "./bento"
import HeroVideoDialog from "./hero-video"


// Updated bento cards data with consistent styling
const bentoFeatures = [
  {
    name: "AI-Powered Idea Validation",
    description: "Get instant feedback on your startup ideas with our advanced AI analysis and market research tools.",
    href: "#",
    cta: "Validate Now",
    className: "col-span-3 lg:col-span-1",
    Icon: Lightbulb,
    background: (
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <Lightbulb className="w-32 h-32 text-[#4ADE80]" />
      </div>
    ),
  },
  {
    name: "Smart Team Matching",
    description:
      "Connect with co-founders, advisors, and team members who complement your skills and vision perfectly.",
    href: "#",
    cta: "Find Your Team",
    className: "col-span-3 lg:col-span-2",
    Icon: Users,
    background: (
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <Users className="w-32 h-32 text-[#637089]" />
      </div>
    ),
  },
  {
    name: "Investor Network Access",
    description:
      "Get discovered by vetted investors and access curated funding opportunities tailored to your startup stage.",
    href: "#",
    cta: "Connect with Investors",
    className: "col-span-3 lg:col-span-2",
    Icon: TrendingUp,
    background: (
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <TrendingUp className="w-32 h-32 text-[#B0B8C1]" />
      </div>
    ),
  },
  {
    name: "Event & Networking Hub",
    description: "Join exclusive startup events, workshops, and networking sessions to accelerate your growth.",
    href: "#",
    cta: "View Events",
    className: "col-span-3 lg:col-span-1",
    Icon: Calendar,
    background: (
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <Calendar className="w-32 h-32 text-[#4ADE80]" />
      </div>
    ),
  },
]

export function HeroSection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C0C0C] to-[#1F2A3C] text-white relative overflow-hidden">
      {/* Abstract background overlay */}
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      {/* Top Notification Bar */}
      <div className="bg-[#4ADE80] text-black py-2 px-4 text-sm text-center relative z-10">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
          <span>🚀 Join 10,000+ entrepreneurs building the future</span>
          <Button variant="link" className="text-black underline p-0 h-auto font-normal hover:text-gray-800">
            Get started now
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#637089] to-[#4ADE80] rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">STARTX</span>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <a href="#" className="text-[#D1D5DB] hover:text-white transition-colors font-medium">
            Features
          </a>
          <a href="#" className="text-[#D1D5DB] hover:text-white transition-colors font-medium">
            Community
          </a>
          <a href="#" className="text-[#D1D5DB] hover:text-white transition-colors font-medium">
            Success Stories
          </a>
        </div>

        <Button className="bg-[#637089] hover:bg-[#5a6478] text-white rounded-full px-6 py-2 font-medium">
          Schedule a call
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-8 py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Side - Hero Content */}
          <div className="space-y-10 pt-8">
            {/* Status Badge */}
            <Badge className="bg-[#4ADE80] text-black rounded-full px-4 py-2 font-medium w-fit">
              <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
              Available for collaboration
            </Badge>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-white">
                STARTX: Create.{" "}
                <AuroraText
                  colors={["#4ADE80", "#637089", "#B0B8C1", "#4ADE80"]}
                  speed={1.5}
                  className="text-5xl lg:text-6xl font-bold"
                >
                  Build.
                </AuroraText>{" "}
                Scale.
              </h1>

              <p className="text-xl text-[#D1D5DB] leading-relaxed max-w-2xl font-normal">
                Connect entrepreneurs, investors, mentors, and job seekers in one collaborative community. Validate
                ideas, find co-founders, secure funding, and build your dream team with AI-powered matching and
                insights.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth"
                className="bg-[#637089] hover:bg-[#5a6478] text-white rounded-full px-8 py-3 font-medium flex items-center justify-center text-center text-base transition-colors duration-200"
                style={{ minWidth: 180 }}
              >
                Start building
              </Link>
            </div>

            {/* Feature Icons */}
            <div className="flex flex-wrap items-center gap-8 pt-12">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#374151] rounded-2xl flex items-center justify-center">
                  <Lightbulb className="w-7 h-7 text-[#4ADE80]" />
                </div>
                <div>
                  <div className="font-semibold text-white text-lg">Idea Validation</div>
                  <div className="text-sm text-[#D1D5DB]">AI-powered insights</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#374151] rounded-2xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-[#637089]" />
                </div>
                <div>
                  <div className="font-semibold text-white text-lg">Team Matching</div>
                  <div className="text-sm text-[#D1D5DB]">Find co-founders</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#374151] rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-[#4ADE80]" />
                </div>
                <div>
                  <div className="font-semibold text-white text-lg">Investor Network</div>
                  <div className="text-sm text-[#D1D5DB]">Curated deal flow</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Hero Video */}
          <div className="relative">
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold text-white">See STARTX in Action</h3>
                <p className="text-[#D1D5DB] text-sm">
                  Watch how entrepreneurs are building successful startups with our platform
                </p>
              </div>

              <div className="relative">
                <HeroVideoDialog
                  className="block dark:hidden"
                  animationStyle="from-center"
                  videoSrc="https://www.youtube.com/embed/wAXGLgWZ7dE?si=sLi96mGnS6ogyiuwG"
                  thumbnailSrc="https://i9.ytimg.com/vi/wAXGLgWZ7dE/mqdefault.jpg?sqp=COSo3cIG-oaymwEmCMACELQB8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGHIgVCg7MA8=&rs=AOn4CLD37qXFtkJgFZI6CDr4Y0h5-MdpMA"
                  thumbnailAlt="Hero Video"
                />
                <HeroVideoDialog
                  className="hidden dark:block"
                  animationStyle="from-center"
                  videoSrc="https://www.youtube.com/embed/wAXGLgWZ7dE?si=sLi96mGnS6ogyiuw"
                  thumbnailSrc="https://i9.ytimg.com/vi/wAXGLgWZ7dE/mqdefault.jpg?sqp=COSo3cIG-oaymwEmCMACELQB8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGHIgVCg7MA8=&rs=AOn4CLD37qXFtkJgFZI6CDr4Y0h5-MdpMA"
                  thumbnailAlt="Hero Video"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grids Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Everything You Need to Build Your Startup
            </h2>
            <p className="text-lg text-[#D1D5DB] max-w-2xl mx-auto">
              From idea validation to team building and funding - we&apos;ve got all the tools and connections you need to
              succeed.
            </p>
          </div>
          <BentoGrid>
            {bentoFeatures.map((feature, idx) => (
              <BentoCard key={idx} {...feature} />
            ))}
          </BentoGrid>
        </div>

        {/* Success Stories Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Success Stories from India</h2>
            <p className="text-lg text-[#D1D5DB] max-w-2xl mx-auto">
              Discover how STARTX helped entrepreneurs, job seekers, and investors achieve their dreams across India&apos;s
              startup ecosystem.
            </p>
          </div>
           <StaggerTestimonials />
          
        </div>
      </div>
    </div>
  )
}
