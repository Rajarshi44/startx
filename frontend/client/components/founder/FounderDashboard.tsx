"use client"

import type React from "react"

import { useState, useRef, RefObject } from "react"
import { toast } from "@/hooks/use-toast"
import { Header } from "./Header"
import { StepNavigation } from "./StepNavigation"
import { IdeaValidationStep } from "./steps/IdeaValidationStep"
import { TeamBuildingStep } from "./steps/TeamBuildingStep"
import { FundingStep } from "./steps/FundingStep"
import { ResultsSection } from "./ResultsSection"
import { Sidebar } from "./Sidebar"
import { Modals } from "./Modals"
import { useFounderData } from "@/hooks/useFounderData"
import { useValidation } from "@/hooks/useValidation"
import { usePolicyResearch } from "@/hooks/usePolicyResearch"
import type { JobForm, CompanyForm, FounderDetailsForm, CofounderProfile, Investor } from "@/types/founder"

export default function FounderDashboard() {
  const {
    founderProfile,
    setFounderProfile,
    companies,
    setCompanies,
    validations,
    setValidations,
    profileLoading,
    user,
    authLoading,
  } = useFounderData()

  const {
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
  } = useValidation(user, companies)

  const { isPolicyResearching, policyResult, policyError, policyResearchComplete, handleResearchPolicies } =
    usePolicyResearch(user, companies)

  // State for other features
  const [activeStep, setActiveStep] = useState("idea")
  const [isMatching, setIsMatching] = useState(false)
  const [cofounderResults, setCofounderResults] = useState<CofounderProfile[]>([])
  const [skillsNeeded, setSkillsNeeded] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [investors, setInvestors] = useState<Investor[]>([])
  const [investorsLoading, setInvestorsLoading] = useState(false)
  const [isPitchGenerating, setIsPitchGenerating] = useState(false)
  const [pitchResult, setPitchResult] = useState<string | null>(null)
  const [pitchError, setPitchError] = useState<string | null>(null)
  const [pitchComplete, setPitchComplete] = useState(false)

  // Modal states
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [showFounderModal, setShowFounderModal] = useState(false)
  const [companyForm, setCompanyForm] = useState<CompanyForm>({
    name: "",
    description: "",
    industry: "",
    stage: "",
    level: "",
    valuation: "",
    match: "",
    sector: "",
  })
  const [founderDetails, setFounderDetails] = useState<FounderDetailsForm>({
    name: "",
    email: "",
    companyCount: "",
    cofounders: "",
    bio: "",
    achievements: [],
  })
  const [companyLoading, setCompanyLoading] = useState(false)
  const [companyError, setCompanyError] = useState<string | null>(null)
  const [founderLoading, setFounderLoading] = useState(false)
  const [founderError, setFounderError] = useState<string | null>(null)

  // Job posting state
  const [jobForm, setJobForm] = useState<JobForm>({
    title: "",
    description: "",
    requirements: "",
    skillsRequired: "",
    experienceLevel: "",
    jobType: "",
    workMode: "",
    salaryRange: "",
    location: "",
    companyId: "",
  })
  const [jobLoading, setJobLoading] = useState(false)
  const [jobError, setJobError] = useState<string | null>(null)

  const formRef = useRef<HTMLFormElement>(null)

  // Handler functions
  const handleFindCofounders = async () => {
    if (!skillsNeeded.trim() || !experienceLevel.trim()) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" })
      return
    }

    setIsMatching(true)
    setCofounderResults([])

    try {
      const queryParams = new URLSearchParams({
        skills: skillsNeeded,
        experience: experienceLevel,
        limit: "6",
      })

      const response = await fetch(`/api/jobseeker?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        const cofounders = data.jobseekers.map((jobseeker: any) => ({
          name:
            `${jobseeker.first_name || ""} ${jobseeker.last_name || ""}`.trim() || jobseeker.user?.name || "Unknown",
          avatar: jobseeker.profile_picture_url || "/placeholder.svg",
          title: `${jobseeker.experience_level || "Professional"}, ${jobseeker.current_status || "Available"}`,
          skills: jobseeker.skills?.slice(0, 3) || ["Professional"],
          compatibility: Math.floor(Math.random() * 20) + 80,
          email: jobseeker.user?.email,
          location: `${jobseeker.city || ""} ${jobseeker.country || ""}`.trim() || "Location not specified",
          bio: jobseeker.bio || "No bio available",
        }))
        setCofounderResults(cofounders.slice(0, 3))
        toast({ title: "Success", description: `Found ${cofounders.length} potential co-founders!` })
      } else {
        throw new Error("Failed to fetch co-founders")
      }
    } catch (error) {
      console.error("Error fetching co-founders:", error)
      toast({ title: "Error", description: "Failed to find co-founders", variant: "destructive" })
    } finally {
      setIsMatching(false)
    }
  }

  const handleFindInvestors = async (industry?: string, stage?: string, fundingGoal?: string) => {
    setInvestorsLoading(true)
    setInvestors([])

    try {
      const queryParams = new URLSearchParams({
        limit: "10",
      })

      if (industry) queryParams.append("industry", industry)
      if (stage) queryParams.append("stage", stage)
      if (fundingGoal) {
        const amount = Number.parseInt(fundingGoal.replace(/[^0-9]/g, ""))
        if (amount) {
          queryParams.append("maxInvestment", amount.toString())
        }
      }

      const response = await fetch(`/api/investor?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        const investorsList = data.investors.map((investor: any) => ({
          id: investor.user.id,
          name: investor.firm_name || investor.user?.name || "Investment Firm",
          email: investor.user?.email,
          description: investor.investment_focus || "Investment firm focusing on growth opportunities",
          minInvestment: investor.min_investment || 100000,
          maxInvestment: investor.max_investment || 2000000,
          preferredStages: investor.preferred_stages || ["Pre-seed", "Seed"],
          preferredIndustries: investor.preferred_industries || ["Technology"],
          portfolio: investor.portfolio_count || 0,
          location: investor.location || "Global",
          bio: investor.bio || "No bio available",
        }))
        setInvestors(investorsList)
        toast({ title: "Success", description: `Found ${investorsList.length} potential investors!` })
      } else {
        throw new Error("Failed to fetch investors")
      }
    } catch (error) {
      console.error("Error fetching investors:", error)
      toast({ title: "Error", description: "Failed to find investors", variant: "destructive" })
    } finally {
      setInvestorsLoading(false)
    }
  }

  const handleGeneratePitch = async () => {
    const userId = user?.username || user?.id
    if (!userId) {
      toast({ title: "Error", description: "Please sign in to generate pitch deck", variant: "destructive" })
      return
    }

    setIsPitchGenerating(true)
    setPitchResult(null)
    setPitchError(null)
    setPitchComplete(false)

    try {
      const res = await fetch("/api/perplexity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: ideaText,
          civicId: userId,
          companyId: companies[0]?.id || null,
          requestType: "pitch",
        }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setPitchError(data.error || "Unknown error from Perplexity API")
        setPitchComplete(false)
        toast({ title: "Error", description: "Failed to generate pitch deck", variant: "destructive" })
      } else {
        const content = data.choices?.[0]?.message?.content || "No pitch deck generated."
        setPitchResult(content)
        setPitchComplete(true)
        toast({ title: "Success", description: "Pitch deck generated successfully!" })
      }
    } catch (e: any) {
      setPitchError(e.message || "Failed to generate pitch deck.")
      setPitchComplete(false)
      toast({ title: "Error", description: "Failed to generate pitch deck", variant: "destructive" })
    } finally {
      setIsPitchGenerating(false)
    }
  }

  const handleJobFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setJobForm({ ...jobForm, [e.target.name]: e.target.value })
  }

  const handleJobFormSelectChange = (name: string, value: string) => {
    setJobForm({ ...jobForm, [name]: value })
  }

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault()
    const userId = user?.username || user?.id
    if (!userId) {
      toast({ title: "Error", description: "Please sign in to post a job", variant: "destructive" })
      return
    }

    if (!jobForm.companyId) {
      toast({ title: "Error", description: "Please select a company", variant: "destructive" })
      return
    }

    setJobLoading(true)
    setJobError(null)

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          civicId: userId,
          companyId: jobForm.companyId,
          title: jobForm.title,
          description: jobForm.description,
          requirements: jobForm.requirements.split("\n").filter((r: string) => r.trim()),
          skillsRequired: jobForm.skillsRequired
            .split(",")
            .map((s: string) => s.trim())
            .filter((s: any) => s),
          experienceLevel: jobForm.experienceLevel,
          jobType: jobForm.jobType,
          workMode: jobForm.workMode,
          salaryRange: jobForm.salaryRange,
          location: jobForm.location,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setJobError(data.error || "Failed to post job.")
        toast({ title: "Error", description: "Failed to post job", variant: "destructive" })
      } else {
        setJobForm({
          title: "",
          description: "",
          requirements: "",
          skillsRequired: "",
          experienceLevel: "",
          jobType: "",
          workMode: "",
          salaryRange: "",
          location: "",
          companyId: "",
        })
        toast({ title: "Success", description: "Job posted successfully!" })
      }
    } catch (e: any) {
      setJobError(e.message || "Failed to post job.")
      toast({ title: "Error", description: "Failed to post job", variant: "destructive" })
    } finally {
      setJobLoading(false)
    }
  }

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
          <div className="font-light text-amber-400 tracking-wide animate-pulse">Authenticating...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-amber-600/5" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255, 215, 0, 0.1) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <Header />

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <StepNavigation activeStep={activeStep} setActiveStep={setActiveStep} />

            {/* Step Content */}
            {activeStep === "idea" && (
              <IdeaValidationStep
                ideaText={ideaText}
                setIdeaText={setIdeaText}
                isValidating={isValidating}
                handleValidateIdea={handleValidateIdea}
                isPolicyResearching={isPolicyResearching}
                handleResearchPolicies={handleResearchPolicies}
              />
            )}

            {activeStep === "team" && (
              <TeamBuildingStep
                skillsNeeded={skillsNeeded}
                setSkillsNeeded={setSkillsNeeded}
                experienceLevel={experienceLevel}
                setExperienceLevel={setExperienceLevel}
                isMatching={isMatching}
                handleFindCofounders={handleFindCofounders}
                jobForm={jobForm}
                handleJobFormChange={handleJobFormChange}
                handleJobFormSelectChange={handleJobFormSelectChange}
                handlePostJob={handlePostJob}
                jobLoading={jobLoading}
                jobError={jobError}
                companies={companies}
              />
            )}

            {activeStep === "funding" && (
              <FundingStep
                handleFindInvestors={handleFindInvestors}
                investorsLoading={investorsLoading}
                ideaText={ideaText}
                setIdeaText={setIdeaText}
                handleGeneratePitch={handleGeneratePitch}
                isPitchGenerating={isPitchGenerating}
              />
            )}

            {/* Results Section */}
            <ResultsSection
              isValidating={isValidating}
              perplexityError={perplexityError}
              validationComplete={validationComplete}
              perplexityResult={perplexityResult}
              showScore={showScore}
              ideaScore={ideaScore}
              isMatching={isMatching}
              cofounderResults={cofounderResults}
              investorsLoading={investorsLoading}
              investors={investors}
              isPolicyResearching={isPolicyResearching}
              policyError={policyError}
              policyResearchComplete={policyResearchComplete}
              policyResult={policyResult}
              isPitchGenerating={isPitchGenerating}
              pitchError={pitchError}
              pitchComplete={pitchComplete}
              pitchResult={pitchResult}
            />
          </div>

          {/* Sidebar */}
          <Sidebar
            founderProfile={founderProfile}
            companies={companies}
            validations={validations}
            validationComplete={validationComplete}
            cofounderResults={cofounderResults}
            ideaScore={ideaScore}
            setShowCompanyModal={setShowCompanyModal}
            setPerplexityResult={setPerplexityResult}
            setIdeaScore={setIdeaScore}
            setShowScore={setShowScore}
            setValidationComplete={setValidationComplete}
            setIdeaText={setIdeaText}
          />
        </div>
      </div>

      {/* Modals */}
      <Modals
        showCompanyModal={showCompanyModal}
        setShowCompanyModal={setShowCompanyModal}
        showFounderModal={showFounderModal}
        setShowFounderModal={setShowFounderModal}
        companyForm={companyForm}
        setCompanyForm={setCompanyForm}
        founderDetails={founderDetails}
        setFounderDetails={setFounderDetails}
        companyLoading={companyLoading}
        setCompanyLoading={setCompanyLoading}
        companyError={companyError}
        setCompanyError={setCompanyError}
        founderLoading={founderLoading}
        setFounderLoading={setFounderLoading}
        founderError={founderError}
        setFounderError={setFounderError}
        formRef={formRef as RefObject<HTMLFormElement>}
        user={user}
        setCompanies={setCompanies}
        setFounderProfile={setFounderProfile}
      />
    </div>
  )
}
