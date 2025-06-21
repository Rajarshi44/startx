"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TrendingUp, FileText, Clock, Sparkles, DollarSign } from "lucide-react"

interface FundingStepProps {
  handleFindInvestors: (industry?: string, stage?: string, fundingGoal?: string) => void
  investorsLoading: boolean
  ideaText: string
  setIdeaText: (text: string) => void
  handleGeneratePitch: () => void
  isPitchGenerating: boolean
}

export function FundingStep({
  handleFindInvestors,
  investorsLoading,
  ideaText,
  setIdeaText,
  handleGeneratePitch,
  isPitchGenerating,
}: FundingStepProps) {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Investor Matching */}
        <Card className="border border-amber-500/20 rounded-2xl bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center text-white font-light text-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center mr-4">
                <TrendingUp className="h-5 w-5 text-black" />
              </div>
              Find Investors
            </CardTitle>
            <CardDescription className="text-gray-400 font-light leading-relaxed ml-14">
              Connect with investors who match your industry and stage
            </CardDescription>
          </CardHeader>
          <CardContent className="ml-14">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const industry = formData.get("industry") as string
                const stage = formData.get("stage") as string
                const fundingGoal = formData.get("fundingGoal") as string
                handleFindInvestors(industry, stage, fundingGoal)
              }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { name: "industry", label: "Industry", placeholder: "e.g., SaaS, FinTech" },
                  { name: "stage", label: "Stage", placeholder: "e.g., Pre-seed, Seed" },
                  { name: "fundingGoal", label: "Funding Goal", placeholder: "e.g., $500K" },
                ].map((field, index) => (
                  <div key={field.name} className="animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">{field.label}</label>
                    <Input
                      name={field.name}
                      placeholder={field.placeholder}
                      className="border border-amber-500/20 rounded-xl bg-black/50 text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 font-light"
                    />
                  </div>
                ))}
              </div>
              <Button
                type="submit"
                disabled={investorsLoading}
                className="font-light px-8 py-3 rounded-xl transition-all duration-300 bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-500 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-105 disabled:opacity-50"
              >
                {investorsLoading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Finding Investors...
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Find Investors
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Pitch Deck Generator */}
        <Card className="border border-amber-500/20 rounded-2xl bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center text-white font-light text-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center mr-4">
                <FileText className="h-5 w-5 text-black" />
              </div>
              Generate Pitch Deck
            </CardTitle>
            <CardDescription className="text-gray-400 font-light leading-relaxed ml-14">
              Create a comprehensive pitch deck with AI assistance
            </CardDescription>
          </CardHeader>
          <CardContent className="ml-14">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">
                  Describe your startup idea for pitch deck generation
                </label>
                <Textarea
                  placeholder="Describe your startup idea, target market, solution, and business model..."
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  className="min-h-[140px] border border-amber-500/20 rounded-xl p-4 bg-black/50 text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 font-light leading-relaxed"
                />
              </div>
              <Button
                onClick={handleGeneratePitch}
                disabled={isPitchGenerating || !ideaText.trim()}
                className="font-light px-8 py-3 rounded-xl transition-all duration-300 bg-gradient-to-r from-rose-400 to-rose-500 text-black hover:from-rose-500 hover:to-rose-600 hover:shadow-lg hover:shadow-rose-500/25 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isPitchGenerating ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Pitch Deck
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
