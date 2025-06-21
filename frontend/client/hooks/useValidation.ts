"use client"

import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import type { Company } from "@/types/founder"

export function useValidation(user: any, companies: Company[]) {
  const [ideaText, setIdeaText] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationComplete, setValidationComplete] = useState(false)
  const [perplexityResult, setPerplexityResult] = useState<string | null>(null)
  const [perplexityError, setPerplexityError] = useState<string | null>(null)
  const [ideaScore, setIdeaScore] = useState<number | null>(null)
  const [showScore, setShowScore] = useState(false)

  const handleValidateIdea = async () => {
    const userId = user?.username || user?.id
    if (!userId) {
      toast({ title: "Error", description: "Please sign in to validate ideas", variant: "destructive" })
      return
    }

    setIsValidating(true)
    setPerplexityResult(null)
    setPerplexityError(null)
    setValidationComplete(false)
    setIdeaScore(null)
    setShowScore(false)

    try {
      const res = await fetch("/api/perplexity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: ideaText,
          civicId: userId,
          companyId: companies[0]?.id || null,
          requestType: "validation",
        }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setPerplexityError(data.error || "Unknown error from Perplexity API")
        setValidationComplete(false)
        toast({ title: "Error", description: "Failed to validate idea", variant: "destructive" })
      } else {
        const content = data.choices?.[0]?.message?.content || "No research result returned."
        setPerplexityResult(content)
        setValidationComplete(true)

        const scoreMatch = content.match(/score[:\s]*(\d+(?:\.\d+)?)/i)
        if (scoreMatch) {
          const score = Number.parseFloat(scoreMatch[1])
          setIdeaScore(score)
          setShowScore(true)
        }

        toast({ title: "Success", description: "Idea validation completed!" })
      }
    } catch (e: any) {
      setPerplexityError(e.message || "Failed to validate idea.")
      setValidationComplete(false)
      toast({ title: "Error", description: "Failed to validate idea", variant: "destructive" })
    } finally {
      setIsValidating(false)
    }
  }

  return {
    ideaText,
    setIdeaText,
    isValidating,
    validationComplete,
    perplexityResult,
    perplexityError,
    ideaScore,
    showScore,
    handleValidateIdea,
    setPerplexityResult,
    setIdeaScore,
    setShowScore,
    setValidationComplete,
  }
}
