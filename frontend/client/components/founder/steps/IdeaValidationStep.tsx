"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Lightbulb, FileText, Clock, Sparkles, Search } from "lucide-react"

interface IdeaValidationStepProps {
  ideaText: string
  setIdeaText: (text: string) => void
  isValidating: boolean
  handleValidateIdea: () => void
  isPolicyResearching: boolean
  handleResearchPolicies: (ideaText: string) => void
}

export function IdeaValidationStep({
  ideaText,
  setIdeaText,
  isValidating,
  handleValidateIdea,
  isPolicyResearching,
  handleResearchPolicies,
}: IdeaValidationStepProps) {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Idea Validation Card */}
        <Card className="border border-amber-500/20 rounded-2xl bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center text-white font-light text-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center mr-4">
                <Lightbulb className="h-5 w-5 text-black" />
              </div>
              Idea Validation
            </CardTitle>
            <CardDescription className="text-gray-400 font-light leading-relaxed ml-14">
              Validate your startup idea with AI-powered market analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="ml-14">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">
                  Describe your startup idea
                </label>
                <Textarea
                  placeholder="Explain your startup idea, target market, and value proposition..."
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  className="min-h-[120px] border border-amber-500/20 rounded-xl p-4 bg-black/50 text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 font-light leading-relaxed"
                />
              </div>
              <Button
                onClick={handleValidateIdea}
                disabled={isValidating || !ideaText.trim()}
                className="font-light px-8 py-3 rounded-xl transition-all duration-300 bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-500 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isValidating ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Validate Idea
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Policy Research Card */}
        <Card className="border border-amber-500/20 rounded-2xl bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center text-white font-light text-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center mr-4">
                <FileText className="h-5 w-5 text-black" />
              </div>
              Policy Research
            </CardTitle>
            <CardDescription className="text-gray-400 font-light leading-relaxed ml-14">
              Discover government policies and regulatory information
            </CardDescription>
          </CardHeader>
          <CardContent className="ml-14">
            <Button
              onClick={() => handleResearchPolicies(ideaText)}
              disabled={isPolicyResearching || !ideaText.trim()}
              className="font-light px-8 py-3 rounded-xl transition-all duration-300 bg-gradient-to-r from-blue-400 to-blue-500 text-black hover:from-blue-500 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isPolicyResearching ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Research Policies
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
