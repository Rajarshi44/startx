"use client"

import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import type { Company } from "@/types/founder"

export function usePolicyResearch(user: any, companies: Company[]) {
  const [isPolicyResearching, setIsPolicyResearching] = useState(false)
  const [policyResult, setPolicyResult] = useState<string | null>(null)
  const [policyError, setPolicyError] = useState<string | null>(null)
  const [policyResearchComplete, setPolicyResearchComplete] = useState(false)

  const handleResearchPolicies = async (ideaText: string) => {
    const userId = user?.username || user?.id
    if (!userId) {
      toast({ title: "Error", description: "Please sign in to research policies", variant: "destructive" })
      return
    }

    setIsPolicyResearching(true)
    setPolicyResult(null)
    setPolicyError(null)
    setPolicyResearchComplete(false)

    try {
      const res = await fetch("/api/perplexity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: ideaText,
          civicId: userId,
          companyId: companies[0]?.id || null,
          requestType: "policy",
        }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setPolicyError(data.error || "Unknown error from Perplexity API")
        setPolicyResearchComplete(false)
        toast({ title: "Error", description: "Failed to research policies", variant: "destructive" })
      } else {
        const content = data.choices?.[0]?.message?.content || "No policy research result returned."
        setPolicyResult(content)
        setPolicyResearchComplete(true)
        toast({ title: "Success", description: "Policy research completed!" })
      }
    } catch (e: any) {
      setPolicyError(e.message || "Failed to research policies.")
      setPolicyResearchComplete(false)
      toast({ title: "Error", description: "Failed to research policies", variant: "destructive" })
    } finally {
      setIsPolicyResearching(false)
    }
  }

  return {
    isPolicyResearching,
    policyResult,
    policyError,
    policyResearchComplete,
    handleResearchPolicies,
  }
}
