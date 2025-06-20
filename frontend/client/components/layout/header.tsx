"use client"

import { ModernButton } from "@/components/ui/modern-button"
import { DisplaySM } from "@/components/ui/typography"
import { Rocket, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full z-50 glass-effect border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-highlight rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
              <Rocket className="h-6 w-6 text-button" />
            </div>
            <DisplaySM className="gradient-text">StartupHub</DisplaySM>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-text/70 hover:text-highlight transition-colors text-lg font-medium">
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-text/70 hover:text-highlight transition-colors text-lg font-medium"
            >
              How it Works
            </Link>
            <Link href="#pricing" className="text-text/70 hover:text-highlight transition-colors text-lg font-medium">
              Pricing
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <ModernButton variant="ghost" asChild>
              <Link href="/auth">Sign In</Link>
            </ModernButton>
            <ModernButton variant="primary" asChild>
              <Link href="/onboarding">Get Started</Link>
            </ModernButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-text hover:text-highlight transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-6 pb-6 border-t border-white/10 pt-6">
            <nav className="flex flex-col space-y-4">
              <Link
                href="#features"
                className="text-text/70 hover:text-highlight transition-colors text-lg font-medium"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-text/70 hover:text-highlight transition-colors text-lg font-medium"
              >
                How it Works
              </Link>
              <Link href="#pricing" className="text-text/70 hover:text-highlight transition-colors text-lg font-medium">
                Pricing
              </Link>
              <div className="flex flex-col space-y-3 pt-4">
                <ModernButton variant="ghost" asChild>
                  <Link href="/auth">Sign In</Link>
                </ModernButton>
                <ModernButton variant="primary" asChild>
                  <Link href="/onboarding">Get Started</Link>
                </ModernButton>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
