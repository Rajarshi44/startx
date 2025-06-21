"use client"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@civic/auth/react"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lightbulb, Users, TrendingUp, FileText, CheckCircle, Clock, Sparkles, Target, DollarSign, Briefcase, MapPin, Building2 } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ChartContainer } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Tabs as ShadTabs, TabsList as ShadTabsList, TabsTrigger as ShadTabsTrigger, TabsContent as ShadTabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function FounderDashboard() {
  const { user, isLoading: authLoading } = useUser()
  const [ideaText, setIdeaText] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationComplete, setValidationComplete] = useState(false)
  const [isMatching, setIsMatching] = useState(false)
  const [cofounderResults, setCofounderResults] = useState<any[]>([])
  const [skillsNeeded, setSkillsNeeded] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [progress, setProgress] = useState(25)
  const [perplexityResult, setPerplexityResult] = useState<string | null>(null)
  const [perplexityError, setPerplexityError] = useState<string | null>(null)
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [companyForm, setCompanyForm] = useState({
    name: "",
    description: "",
    industry: "",
    stage: "",
    level: "",
    valuation: "",
    match: "",
    sector: ""
  })
  const [companyLoading, setCompanyLoading] = useState(false)
  const [companyError, setCompanyError] = useState<string | null>(null)
  const [companySuccess, setCompanySuccess] = useState(false)
  const [ideaScore, setIdeaScore] = useState<number | null>(null)
  const [showScore, setShowScore] = useState(false)
  const [showFounderModal, setShowFounderModal] = useState(false)
  const [founderDetails, setFounderDetails] = useState({
    name: "",
    email: "",
    companyCount: "",
    cofounders: "",
    bio: "",
    achievements: []
  })
  const [founderLoading, setFounderLoading] = useState(false)
  const [founderError, setFounderError] = useState<string | null>(null)
  const [founderProfile, setFounderProfile] = useState<any>(null)
  const [companies, setCompanies] = useState<any[]>([])
  const [validations, setValidations] = useState<any[]>([])
  const [profileLoading, setProfileLoading] = useState(true)
  const [investors, setInvestors] = useState<any[]>([])
  const [jobseekers, setJobseekers] = useState<any[]>([])
  const [investorsLoading, setInvestorsLoading] = useState(false)
  const [jobseekersLoading, setJobseekersLoading] = useState(false)
  
  // Job posting state
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    requirements: "",
    skillsRequired: "",
    experienceLevel: "",
    jobType: "",
    workMode: "",
    salaryRange: "",
    location: "",
    companyId: ""
  })
  const [jobLoading, setJobLoading] = useState(false)
  const [jobError, setJobError] = useState<string | null>(null)
  const [postedJobs, setPostedJobs] = useState<any[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)
  
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    let completedTasks = 0
    const totalTasks = 4

    if (validationComplete) completedTasks++
    if (cofounderResults.length > 0) completedTasks++
    // Add more conditions as features are completed

    const newProgress = (completedTasks / totalTasks) * 100
    setProgress(newProgress)
  }, [validationComplete, cofounderResults.length])

  // Load founder profile and data
  useEffect(() => {
    const loadFounderData = async () => {
      if (authLoading) return // Wait for auth to load
      const userId = user?.username || user?.id;
      if (!userId) {
        console.log("No user identifier found:", user)
        console.log("User keys:", user ? Object.keys(user) : "no user") 
        return
      }
      
      console.log("Loading founder data for user:", userId)
      
      setProfileLoading(true)
      try {
        const response = await fetch(`/api/founder/profile?civicId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setFounderProfile(data.profile)
          setCompanies(data.companies || [])
          setValidations(data.validations || [])
          
          if (!data.profile) {
            setShowFounderModal(true)
          }
        }
      } catch (error) {
        console.error("Error loading founder data:", error)
        setShowFounderModal(true)
      } finally {
        setProfileLoading(false)
      }
    }

    loadFounderData()
  }, [user?.username, user?.id, authLoading])

  // Load initial investors and jobseekers data
  useEffect(() => {
    const loadInitialData = async () => {
      if (authLoading) return
      
      // Load some initial investors
      try {
        const response = await fetch('/api/investor?limit=5')
        if (response.ok) {
          const data = await response.json()
          const investorsList = data.investors.map((investor: any) => ({
            id: investor.user.id,
            name: investor.firm_name || investor.user?.name || 'Investment Firm',
            email: investor.user?.email,
            description: investor.investment_focus || 'Investment firm focusing on growth opportunities',
            minInvestment: investor.min_investment || 100000,
            maxInvestment: investor.max_investment || 2000000,
            preferredStages: investor.preferred_stages || ['Pre-seed', 'Seed'],
            preferredIndustries: investor.preferred_industries || ['Technology'],
            portfolio: investor.portfolio_count || 0,
            location: investor.location || 'Global',
            bio: investor.bio || 'No bio available'
          }))
          setInvestors(investorsList)
        }
      } catch (error) {
        console.error('Error loading initial investors:', error)
      }
    }

    loadInitialData()
  }, [authLoading])

  useEffect(() => {
    const userId = user?.username || user?.id;
    if (!authLoading && !userId) {
      setShowFounderModal(true)
    }
  }, [user, authLoading])

  // Load posted jobs
  useEffect(() => {
    const loadPostedJobs = async () => {
      if (authLoading) return
      const userId = user?.username || user?.id;
      if (!userId) return
      
      setJobsLoading(true)
      try {
        const response = await fetch(`/api/jobs?civicId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setPostedJobs(data.jobs || [])
        }
      } catch (error) {
        console.error("Error loading posted jobs:", error)
      } finally {
        setJobsLoading(false)
      }
    }

    loadPostedJobs()
  }, [user?.username, user?.id, authLoading])

  const mockProfiles = [
    {
      name: "Sarah Chen",
      avatar: "/placeholder.svg?height=48&width=48",
      title: "Full-stack Developer, 8 years exp",
      skills: ["React", "Node.js", "AI/ML"],
      compatibility: 92,
    },
    {
      name: "Alex Ivanov",
      avatar: "/placeholder.svg?height=48&width=48",
      title: "Product Designer, 6 years exp",
      skills: ["Figma", "UX", "Branding"],
      compatibility: 88,
    },
    {
      name: "Priya Patel",
      avatar: "/placeholder.svg?height=48&width=48",
      title: "Growth Marketer, 10 years exp",
      skills: ["SEO", "Content", "Paid Ads"],
      compatibility: 85,
    },
    {
      name: "David Kim",
      avatar: "/placeholder.svg?height=48&width=48",
      title: "AI Engineer, 5 years exp",
      skills: ["Python", "TensorFlow", "LLMs"],
      compatibility: 90,
    },
  ]

    const handleValidateIdea = async () => {
    if (authLoading) {
      toast({ title: "Info", description: "Please wait while we authenticate you" })
      return
    }
    const userId = user?.username || user?.id;
    if (!userId) {
      console.log("User state:", user)
      console.log("User keys:", user ? Object.keys(user) : "no user")
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
          companyId: companies[0]?.id || null 
        }),
      })
      const data = await res.json()
      
      if (!res.ok || data.error) {
        setPerplexityError(data.error || "Unknown error from Perplexity API")
        setValidationComplete(false)
        toast({ title: "Error", description: "Failed to validate idea", variant: "destructive" })
      } else {
        // Perplexity returns { choices: [{ message: { content: string } }] }
        const content = data.choices?.[0]?.message?.content || "No research result returned."
        setPerplexityResult(content)
        setValidationComplete(true)
        
        // Calculate idea score from the content
        const scoreMatch = content.match(/score[:\s]*(\d+(?:\.\d+)?)/i)
        if (scoreMatch) {
          const score = parseFloat(scoreMatch[1])
          setIdeaScore(score)
          setShowScore(true)
        }
        
        // Reload validations to show the new one
        const validationRes = await fetch(`/api/founder/idea-validation?civicId=${userId}`)
        if (validationRes.ok) {
          const validationData = await validationRes.json()
          setValidations(validationData.validations || [])
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
        limit: "6"
      })
      
      const response = await fetch(`/api/jobseeker?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        const cofounders = data.jobseekers.map((jobseeker: any) => ({
          name: `${jobseeker.first_name || ''} ${jobseeker.last_name || ''}`.trim() || jobseeker.user?.name || 'Unknown',
          avatar: jobseeker.profile_picture_url || "/placeholder.svg",
          title: `${jobseeker.experience_level || 'Professional'}, ${jobseeker.current_status || 'Available'}`,
          skills: jobseeker.skills?.slice(0, 3) || ['Professional'],
          compatibility: Math.floor(Math.random() * 20) + 80, // Random compatibility for now
          email: jobseeker.user?.email,
          location: `${jobseeker.city || ''} ${jobseeker.country || ''}`.trim() || 'Location not specified',
          bio: jobseeker.bio || 'No bio available'
        }))
        setCofounderResults(cofounders.slice(0, 3))
        toast({ title: "Success", description: `Found ${cofounders.length} potential co-founders!` })
      } else {
        throw new Error('Failed to fetch co-founders')
      }
    } catch (error) {
      console.error('Error fetching co-founders:', error)
      toast({ title: "Error", description: "Failed to find co-founders", variant: "destructive" })
      // Fallback to mock data
      const shuffled = mockProfiles.sort(() => 0.5 - Math.random())
      setCofounderResults(shuffled.slice(0, 3))
    } finally {
      setIsMatching(false)
    }
  }

  const handleFindInvestors = async (industry?: string, stage?: string, fundingGoal?: string) => {
    setInvestorsLoading(true)
    setInvestors([])
    
    try {
      const queryParams = new URLSearchParams({
        limit: "10"
      })
      
      if (industry) queryParams.append('industry', industry)
      if (stage) queryParams.append('stage', stage)
      if (fundingGoal) {
        const amount = parseInt(fundingGoal.replace(/[^0-9]/g, ''))
        if (amount) {
          queryParams.append('maxInvestment', amount.toString())
        }
      }
      
      const response = await fetch(`/api/investor?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        const investorsList = data.investors.map((investor: any) => ({
          id: investor.user.id,
          name: investor.firm_name || investor.user?.name || 'Investment Firm',
          email: investor.user?.email,
          description: investor.investment_focus || 'Investment firm focusing on growth opportunities',
          minInvestment: investor.min_investment || 100000,
          maxInvestment: investor.max_investment || 2000000,
          preferredStages: investor.preferred_stages || ['Pre-seed', 'Seed'],
          preferredIndustries: investor.preferred_industries || ['Technology'],
          portfolio: investor.portfolio_count || 0,
          location: investor.location || 'Global',
          bio: investor.bio || 'No bio available'
        }))
        setInvestors(investorsList)
        toast({ title: "Success", description: `Found ${investorsList.length} potential investors!` })
      } else {
        throw new Error('Failed to fetch investors')
      }
    } catch (error) {
      console.error('Error fetching investors:', error)
      toast({ title: "Error", description: "Failed to find investors", variant: "destructive" })
      // Fallback to mock data
      const mockInvestors = [
        {
          id: '1',
          name: 'TechVentures Capital',
          email: 'contact@techventures.com',
          description: 'Early-stage VC focusing on SaaS',
          minInvestment: 100000,
          maxInvestment: 2000000,
          preferredStages: ['Pre-seed', 'Seed'],
          preferredIndustries: ['SaaS', 'FinTech'],
          portfolio: 25,
          location: 'San Francisco',
          bio: 'Leading early-stage investment firm'
        },
        {
          id: '2',
          name: 'Growth Partners Fund',
          email: 'team@growthpartners.com',
          description: 'Series A focused investment fund',
          minInvestment: 500000,
          maxInvestment: 5000000,
          preferredStages: ['Series A', 'Series B'],
          preferredIndustries: ['HealthTech', 'EdTech'],
          portfolio: 40,
          location: 'New York',
          bio: 'Scaling innovative companies globally'
        }
      ]
      setInvestors(mockInvestors)
    } finally {
      setInvestorsLoading(false)
    }
  }

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCompanyForm({ ...companyForm, [e.target.name]: e.target.value })
  }

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    const userId = user?.username || user?.id;
    if (!userId) {
      toast({ title: "Error", description: "Please sign in to create a company", variant: "destructive" })
      return
    }

    setCompanyLoading(true)
    setCompanyError(null)
    setCompanySuccess(false)
    
    try {
      const res = await fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...companyForm,
          civicId: userId
        }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        setCompanyError(data.error || "Failed to create company.")
        toast({ title: "Error", description: "Failed to create company", variant: "destructive" })
      } else {
        const data = await res.json()
        setCompanySuccess(true)
        setShowCompanyModal(false)
        setCompanyForm({
          name: "",
          description: "",
          industry: "",
          stage: "",
          level: "",
          valuation: "",
          match: "",
          sector: ""
        })
        
        // Reload companies
        const companiesRes = await fetch(`/api/company?civicId=${userId}`)
        if (companiesRes.ok) {
          const companiesData = await companiesRes.json()
          setCompanies(companiesData.companies || [])
        }
        
        toast({ title: "Success", description: "Company created successfully!" })
      }
    } catch (e: any) {
      setCompanyError(e.message || "Failed to create company.")
      toast({ title: "Error", description: "Failed to create company", variant: "destructive" })
    } finally {
      setCompanyLoading(false)
    }
  }

  const handleFounderDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFounderDetails({ ...founderDetails, [e.target.name]: e.target.value })
  }

  const handleFounderDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const userId = user?.username || user?.id;
    if (!userId) {
      toast({ title: "Error", description: "Please sign in to save founder details", variant: "destructive" })
      return
    }

    setFounderLoading(true)
    setFounderError(null)
    
    try {
      // First update user role
      const roleRes = await fetch("/api/user/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          civicId: userId,
          role: "founder",
          email: founderDetails.email,
          name: founderDetails.name
        }),
      })
      
      if (!roleRes.ok) {
        const roleData = await roleRes.json()
        setFounderError(roleData.error || "Failed to update role.")
        toast({ title: "Error", description: "Failed to update role", variant: "destructive" })
        return
      }

      // Then create/update founder profile
      const profileRes = await fetch("/api/founder/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          civicId: userId,
          company_count: parseInt(founderDetails.companyCount) || 0,
          cofounders: founderDetails.cofounders.split('\n').filter(c => c.trim()),
          bio: founderDetails.bio,
          achievements: founderDetails.achievements
        }),
      })

      if (!profileRes.ok) {
        const profileData = await profileRes.json()
        setFounderError(profileData.error || "Failed to save profile.")
        toast({ title: "Error", description: "Failed to save profile", variant: "destructive" })
      } else {
        const profileData = await profileRes.json()
        setFounderProfile(profileData.profile)
        setShowFounderModal(false)
        toast({ title: "Success", description: "Founder profile created successfully!" })
      }
    } catch (e: any) {
      setFounderError(e.message || "Failed to save details.")
      toast({ title: "Error", description: "Failed to save details", variant: "destructive" })
    } finally {
      setFounderLoading(false)
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
    const userId = user?.username || user?.id;
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
          requirements: jobForm.requirements.split('\n').filter(r => r.trim()),
          skillsRequired: jobForm.skillsRequired.split(',').map(s => s.trim()).filter(s => s),
          experienceLevel: jobForm.experienceLevel,
          jobType: jobForm.jobType,
          workMode: jobForm.workMode,
          salaryRange: jobForm.salaryRange,
          location: jobForm.location
        }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        setJobError(data.error || "Failed to post job.")
        toast({ title: "Error", description: "Failed to post job", variant: "destructive" })
      } else {
        const data = await res.json()
        setPostedJobs([data.job, ...postedJobs])
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
          companyId: ""
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
          <div className="font-light text-amber-400 tracking-wide animate-pulse">
            Authenticating...
          </div>
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

      {/* Header */}
      <header className="relative z-10 border-b border-amber-500/20 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-light tracking-tight text-white animate-fade-in">Founder Dashboard</h1>
              <p className="text-gray-400 font-light tracking-wide animate-fade-in-delay">
                Build your startup from idea to investment
              </p>
            </div>
            <Badge className="px-4 py-2 rounded-full font-light tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/25 animate-glow">
              Founder Journey
            </Badge>
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="idea" className="space-y-8">
              <TabsList className="grid w-full grid-cols-5 p-1 rounded-xl bg-gray-900/50 border border-amber-500/20 backdrop-blur-sm">
                {["idea", "team", "investors", "jobs", "pitch"].map((tab, index) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-amber-500 data-[state=active]:text-black rounded-lg transition-all duration-300 hover:text-white font-light tracking-wide capitalize animate-slide-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="idea" className="space-y-8 animate-fade-in-up">
                <Card className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center text-white font-light text-xl">
                      <Lightbulb className="mr-3 h-6 w-6 text-amber-400 animate-pulse-soft" />
                      Idea Validation
                    </CardTitle>
                    <CardDescription className="text-gray-400 font-light leading-relaxed">
                      Validate your startup idea with AI-powered market analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">
                          Describe your startup idea
                        </label>
                        <Textarea
                          placeholder="Explain your startup idea, target market, and value proposition..."
                          value={ideaText}
                          onChange={(e) => setIdeaText(e.target.value)}
                          className="min-h-[140px] border border-amber-500/20 rounded-xl p-4 bg-black/50 text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 font-light leading-relaxed"
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

                {isValidating && (
                  <div className="flex justify-center py-8 animate-fade-in">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
                      <div className="font-light text-amber-400 tracking-wide animate-pulse">
                        Researching your idea ..
                      </div>
                    </div>
                  </div>
                )}

                {perplexityError && (
                  <Card className="border border-red-500/30 rounded-2xl bg-black/80 backdrop-blur-sm animate-slide-in-up shadow-2xl shadow-red-500/10">
                    <CardHeader>
                      <CardTitle className="text-red-400 font-light text-xl">Validation Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-red-300 font-light">{perplexityError}</div>
                    </CardContent>
                  </Card>
                )}

                {validationComplete && perplexityResult && (
                  <Card className="border border-amber-500/30 rounded-2xl bg-black/80 backdrop-blur-sm animate-slide-in-up shadow-2xl shadow-amber-500/10">
                    <CardHeader>
                      <CardTitle className="text-white font-light text-xl">Validation Results</CardTitle>
                      {showScore && ideaScore && (
                        <div className={`text-center py-6 ${ideaScore >= 7 ? 'text-green-400' : 'text-amber-400'}`}>
                          <div className="text-6xl font-bold mb-2">
                            {ideaScore}/10
                          </div>
                          <div className="text-xl font-semibold mb-2">
                            Idea Score
                          </div>
                          {ideaScore >= 7 && (
                            <div className="text-lg text-green-300 mt-4 p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                              🎉 Excellent! This idea shows strong potential. Consider creating a company profile to track your progress.
                            </div>
                          )}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="prose prose-invert max-w-none text-white">
                      {(() => {
                        // Parse markdown into sections
                        const sectionOrder = [
                          "Market Demand",
                          "SWOT Analysis",
                          "Competitor Analysis",
                          "Similar Companies",
                          "Suggestions for Improvement",
                          "Key Analytics and Scores"
                        ];
                        const sectionRegex = /## ([^\n]+)\n([\s\S]*?)(?=\n## |$)/g;
                        const sections: Record<string, string> = {};
                        let match;
                        while ((match = sectionRegex.exec(perplexityResult))) {
                          sections[match[1].trim()] = match[2].trim();
                        }
                        // Chart data for Key Analytics and Scores
                        const chartData = [
                          {
                            name: "Online Books",
                            value: 26.04,
                            label: "Books 2025 ($B)"
                          },
                          {
                            name: "Books 2034",
                            value: 48.27,
                            label: "Books 2034 ($B)"
                          },
                          {
                            name: "E-Book Subscriptions",
                            value: 8.7,
                            label: "E-Book Subs 2033 ($B)"
                          },
                          {
                            name: "CAGR",
                            value: 7.1,
                            label: "Books CAGR (%)"
                          },
                          {
                            name: "E-Book CAGR",
                            value: 9.5,
                            label: "E-Book CAGR (%)"
                          }
                        ];
                        const barColors = ["#fbbf24", "#f59e42", "#fcd34d", "#a3e635", "#38bdf8"];
                        return (
                          <ShadTabs defaultValue={sectionOrder[0]} className="w-full">
                            <ShadTabsList className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-6 bg-black/30 border border-amber-500/20 rounded-xl">
                              {sectionOrder.map((section: string) => (
                                <ShadTabsTrigger
                                  key={section}
                                  value={section}
                                  className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-amber-500 data-[state=active]:text-black rounded-lg transition-all duration-300 hover:text-white font-light tracking-wide capitalize"
                                >
                                  {section}
                                </ShadTabsTrigger>
                              ))}
                            </ShadTabsList>
                            {sectionOrder.map((section: string) => (
                              <ShadTabsContent key={section} value={section} className="pt-2">
                                {section === "Key Analytics and Scores" && (
                                  <div className="mb-8">
                                    <h3 className="text-lg font-semibold mb-4 text-amber-400">Key Analytics and Scores</h3>
                                    <ChartContainer config={{ Books: { color: barColors[0] }, Books2034: { color: barColors[1] }, EBook: { color: barColors[2] }, CAGR: { color: barColors[3] }, EBookCAGR: { color: barColors[4] } }}>
                                      <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={chartData} margin={{ left: 16, right: 16, top: 16, bottom: 8 }}>
                                          <XAxis dataKey="label" tick={{ fill: "#fff", fontSize: 13 }} axisLine={false} tickLine={false} />
                                          <YAxis tick={{ fill: "#fff", fontSize: 13 }} axisLine={false} tickLine={false} />
                                          <Tooltip contentStyle={{ background: "#222", border: "none", color: "#fff" }} cursor={{ fill: "#fbbf2433" }} />
                                          <Bar dataKey="value">
                                            {chartData.map((entry, i) => (
                                              <Cell key={entry.name} fill={barColors[i]} />
                                            ))}
                                          </Bar>
                                        </BarChart>
                                      </ResponsiveContainer>
                                    </ChartContainer>
                                  </div>
                                )}
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{sections[section] || "No data."}</ReactMarkdown>
                              </ShadTabsContent>
                            ))}
                          </ShadTabs>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="team" className="space-y-8 animate-fade-in-up">
                <Card className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white font-light text-xl">
                      <Users className="mr-3 h-6 w-6 text-amber-400 animate-pulse-soft" />
                      Co-founder Matching
                    </CardTitle>
                    <CardDescription className="text-gray-400 font-light leading-relaxed">
                      Find compatible co-founders based on skills, experience, and personality
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">
                            Skills Needed
                          </label>
                          <Input
                            placeholder="e.g., Technical, Marketing, Sales"
                            value={skillsNeeded}
                            onChange={(e) => setSkillsNeeded(e.target.value)}
                            className="border border-amber-500/20 rounded-xl bg-black/50 text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 font-light"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">
                            Experience Level
                          </label>
                          <Input
                            placeholder="e.g., 5+ years, Senior level"
                            value={experienceLevel}
                            onChange={(e) => setExperienceLevel(e.target.value)}
                            className="border border-amber-500/20 rounded-xl bg-black/50 text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 font-light"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleFindCofounders}
                        disabled={isMatching || !skillsNeeded.trim() || !experienceLevel.trim()}
                        className="font-light px-8 py-3 rounded-xl transition-all duration-300 bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-500 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-105 disabled:opacity-50"
                      >
                        {isMatching ? (
                          <>
                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                            Matching...
                          </>
                        ) : (
                          <>
                            <Users className="mr-2 h-4 w-4" />
                            Find Co-founders
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {isMatching && (
                  <div className="flex justify-center py-12 animate-fade-in">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
                      <div className="font-light text-amber-400 tracking-wide animate-pulse">
                        Finding your best matches...
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {cofounderResults.map((profile, i) => (
                    <Card
                      key={profile.name}
                      className="border border-amber-500/30 rounded-2xl bg-black/80 backdrop-blur-sm hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500 group animate-slide-in-up hover:scale-105"
                      style={{ animationDelay: `${i * 150}ms` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="w-14 h-14 ring-2 ring-amber-400/50 group-hover:ring-amber-400 transition-all duration-300">
                            <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-500 text-black font-light">
                              {profile.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-3">
                            <h4 className="font-light text-lg text-white group-hover:text-amber-300 transition-colors duration-300">
                              {profile.name}
                            </h4>
                            <p className="text-sm text-gray-400 font-light">{profile.title}</p>
                            <div className="flex flex-wrap gap-2">
                              {profile.skills.map((skill: string) => (
                                <Badge
                                  key={skill}
                                  className="text-xs px-3 py-1 rounded-full bg-black/50 text-gray-300 border border-amber-500/20 font-light"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                            <div className="text-sm font-light text-amber-400 animate-pulse-soft">
                              {profile.compatibility}% Compatibility Match
                            </div>
                            {profile.location && (
                              <div className="text-xs text-gray-500 font-light">
                                📍 {profile.location}
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-500 hover:to-amber-600 transition-all duration-300 font-light hover:scale-105"
                              >
                                Connect
                              </Button>
                              {profile.email && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs px-3 py-2 rounded-lg border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-light"
                                  onClick={() => window.open(`mailto:${profile.email}`, '_blank')}
                                >
                                  Email
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="investors" className="space-y-8 animate-fade-in-up">
                <Card className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white font-light text-xl">
                      <TrendingUp className="mr-3 h-6 w-6 text-amber-400 animate-pulse-soft" />
                      Investor Matching
                    </CardTitle>
                    <CardDescription className="text-gray-400 font-light leading-relaxed">
                      Connect with investors who match your industry and stage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      const industry = formData.get('industry') as string
                      const stage = formData.get('stage') as string  
                      const fundingGoal = formData.get('fundingGoal') as string
                      handleFindInvestors(industry, stage, fundingGoal)
                    }} className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        {[
                          { name: "industry", label: "Industry", placeholder: "e.g., SaaS, FinTech" },
                          { name: "stage", label: "Stage", placeholder: "e.g., Pre-seed, Seed" },
                          { name: "fundingGoal", label: "Funding Goal", placeholder: "e.g., $500K" }
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

                {investorsLoading && (
                  <div className="flex justify-center py-12 animate-fade-in">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
                      <div className="font-light text-amber-400 tracking-wide animate-pulse">
                        Finding investors...
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {investors.map((investor, i) => (
                    <Card
                      key={investor.id}
                      className="border border-amber-500/30 rounded-2xl bg-black/80 backdrop-blur-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500 animate-slide-in"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-500/25">
                              <DollarSign className="h-7 w-7 text-black" />
                            </div>
                            <div className="space-y-3">
                              <h4 className="font-light text-lg text-white">{investor.name}</h4>
                              <p className="text-sm text-gray-400 font-light">{investor.description}</p>
                              <div className="flex items-center flex-wrap gap-4 text-sm text-gray-400 font-light">
                                <span>${(investor.minInvestment / 1000)}K - ${(investor.maxInvestment / 1000)}K</span>
                                <span className="text-amber-500">•</span>
                                <span>{investor.preferredStages?.join(', ') || 'All stages'}</span>
                                {investor.portfolio > 0 && (
                                  <>
                                    <span className="text-amber-500">•</span>
                                    <span>{investor.portfolio} portfolio companies</span>
                                  </>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {investor.preferredIndustries?.slice(0, 3).map((industry: string) => (
                                  <Badge key={industry} className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-light text-xs">
                                    {industry}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="text-sm px-6 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-500 hover:to-amber-600 transition-all duration-300 font-light hover:scale-105"
                          >
                            Connect
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="jobs" className="space-y-8 animate-fade-in-up">
                <Card className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white font-light text-xl">
                      <Briefcase className="mr-3 h-6 w-6 text-amber-400 animate-pulse-soft" />
                      Post a Job
                    </CardTitle>
                    <CardDescription className="text-gray-400 font-light leading-relaxed">
                      Find talented individuals to join your team
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePostJob} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">
                            Company *
                          </label>
                          <Select value={jobForm.companyId} onValueChange={(value) => handleJobFormSelectChange('companyId', value)}>
                            <SelectTrigger className="border border-amber-500/20 rounded-xl bg-black/50 text-white focus:border-amber-500/60">
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                            <SelectContent>
                              {companies.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                  {company.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">
                            Job Title *
                          </label>
                          <Input
                            name="title"
                            placeholder="e.g., Frontend Developer"
                            value={jobForm.title}
                            onChange={handleJobFormChange}
                            required
                            className="border border-amber-500/20 rounded-xl bg-black/50 text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 font-light"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">
                          Job Description
                        </label>
                        <Textarea
                          name="description"
                          placeholder="Describe the role, responsibilities, and what you're looking for..."
                          value={jobForm.description}
                          onChange={handleJobFormChange}
                          className="min-h-[120px] border border-amber-500/20 rounded-xl p-4 bg-black/50 text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 font-light leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">
                          Requirements (one per line)
                        </label>
                        <Textarea
                          name="requirements"
                          placeholder="Bachelor's degree in Computer Science&#10;3+ years of React experience&#10;Strong problem-solving skills"
                          value={jobForm.requirements}
                          onChange={handleJobFormChange}
                          className="border border-amber-500/20 rounded-xl p-4 bg-black/50 text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 font-light leading-relaxed"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">
                            Skills Required (comma-separated)
                          </label>
                          <Input
                            name="skillsRequired"
                            placeholder="React, TypeScript, Node.js"
                            value={jobForm.skillsRequired}
                            onChange={handleJobFormChange}
                            className="border border-amber-500/20 rounded-xl bg-black/50 text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 font-light"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">
                            Experience Level
                          </label>
                          <Select value={jobForm.experienceLevel} onValueChange={(value) => handleJobFormSelectChange('experienceLevel', value)}>
                            <SelectTrigger className="border border-amber-500/20 rounded-xl bg-black/50 text-white focus:border-amber-500/60">
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                              <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
                              <SelectItem value="senior">Senior Level (5+ years)</SelectItem>
                              <SelectItem value="lead">Lead/Principal (8+ years)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">
                            Job Type
                          </label>
                          <Select value={jobForm.jobType} onValueChange={(value) => handleJobFormSelectChange('jobType', value)}>
                            <SelectTrigger className="border border-amber-500/20 rounded-xl bg-black/50 text-white focus:border-amber-500/60">
                              <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full-time">Full-time</SelectItem>
                              <SelectItem value="part-time">Part-time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">
                            Work Mode
                          </label>
                          <Select value={jobForm.workMode} onValueChange={(value) => handleJobFormSelectChange('workMode', value)}>
                            <SelectTrigger className="border border-amber-500/20 rounded-xl bg-black/50 text-white focus:border-amber-500/60">
                              <SelectValue placeholder="Select work mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="remote">Remote</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                              <SelectItem value="on-site">On-site</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">
                            Salary Range
                          </label>
                          <Input
                            name="salaryRange"
                            placeholder="e.g., $80k - $120k"
                            value={jobForm.salaryRange}
                            onChange={handleJobFormChange}
                            className="border border-amber-500/20 rounded-xl bg-black/50 text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 font-light"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">
                          Location
                        </label>
                        <Input
                          name="location"
                          placeholder="e.g., San Francisco, CA or Remote"
                          value={jobForm.location}
                          onChange={handleJobFormChange}
                          className="border border-amber-500/20 rounded-xl bg-black/50 text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 font-light"
                        />
                      </div>

                      {jobError && (
                        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                          {jobError}
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={jobLoading || companies.length === 0}
                        className="font-light px-8 py-3 rounded-xl transition-all duration-300 bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-500 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-105 disabled:opacity-50"
                      >
                        {jobLoading ? (
                          <>
                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                            Posting Job...
                          </>
                        ) : (
                          <>
                            <Briefcase className="mr-2 h-4 w-4" />
                            Post Job
                          </>
                        )}
                      </Button>

                      {companies.length === 0 && (
                        <div className="text-amber-400 text-sm bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                          You need to create a company first before posting jobs.
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>

                {/* Posted Jobs */}
                <Card className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white font-light text-xl">
                      <Building2 className="mr-3 h-6 w-6 text-amber-400 animate-pulse-soft" />
                      Your Posted Jobs
                    </CardTitle>
                    <CardDescription className="text-gray-400 font-light leading-relaxed">
                      Manage your active job postings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {jobsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
                          <div className="font-light text-amber-400 text-sm">Loading jobs...</div>
                        </div>
                      </div>
                    ) : postedJobs.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <Briefcase className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p className="font-light">No jobs posted yet</p>
                        <p className="text-sm mt-2">Create your first job posting above</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {postedJobs.map((job, i) => (
                          <Card
                            key={job.id}
                            className="border border-amber-500/30 rounded-xl bg-black/50 hover:bg-black/70 transition-all duration-300 animate-slide-in"
                            style={{ animationDelay: `${i * 100}ms` }}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-4">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="text-xl font-light text-white mb-2">{job.title}</h4>
                                      <div className="flex items-center text-sm text-gray-400 space-x-4">
                                        <span className="flex items-center">
                                          <Building2 className="h-4 w-4 mr-1" />
                                          {job.company?.name}
                                        </span>
                                        {job.location && (
                                          <span className="flex items-center">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            {job.location}
                                          </span>
                                        )}
                                        {job.salary_range && (
                                          <span className="flex items-center">
                                            <DollarSign className="h-4 w-4 mr-1" />
                                            {job.salary_range}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <Badge
                                      className={`${
                                        job.status === 'active'
                                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                          : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                                      } font-light`}
                                    >
                                      {job.status}
                                    </Badge>
                                  </div>

                                  {job.description && (
                                    <p className="text-gray-300 font-light leading-relaxed line-clamp-3">
                                      {job.description}
                                    </p>
                                  )}

                                  <div className="flex flex-wrap gap-4 text-sm">
                                    {job.job_type && (
                                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 font-light text-xs">
                                        {job.job_type}
                                      </Badge>
                                    )}
                                    {job.work_mode && (
                                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-light text-xs">
                                        {job.work_mode}
                                      </Badge>
                                    )}
                                    {job.experience_level && (
                                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-light text-xs">
                                        {job.experience_level}
                                      </Badge>
                                    )}
                                  </div>

                                  {job.skills_required && job.skills_required.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {job.skills_required.slice(0, 5).map((skill: string) => (
                                        <Badge key={skill} className="bg-gray-500/20 text-gray-300 border-gray-500/30 font-light text-xs">
                                          {skill}
                                        </Badge>
                                      ))}
                                      {job.skills_required.length > 5 && (
                                        <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 font-light text-xs">
                                          +{job.skills_required.length - 5} more
                                        </Badge>
                                      )}
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>Posted on {new Date(job.created_at).toLocaleDateString()}</span>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs h-7 px-3 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-light"
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs h-7 px-3 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 font-light"
                                      >
                                        View Applications
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pitch" className="space-y-8 animate-fade-in-up">
                <Card className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white font-light text-xl">
                      <FileText className="mr-3 h-6 w-6 text-amber-400 animate-pulse-soft" />
                      Pitch Deck Builder
                    </CardTitle>
                    <CardDescription className="text-gray-400 font-light leading-relaxed">
                      Create a compelling pitch deck with AI assistance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {["Company Name", "Industry"].map((label, index) => (
                          <div key={label} className="animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                            <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">{label}</label>
                            <Input
                              placeholder={label === "Company Name" ? "Your startup name" : "e.g., FinTech, HealthTech"}
                              className="border border-amber-500/20 rounded-xl bg-black/50 text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 font-light"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="animate-slide-in" style={{ animationDelay: "200ms" }}>
                        <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">One-liner</label>
                        <Input
                          placeholder="Describe your startup in one sentence"
                          className="border border-amber-500/20 rounded-xl bg-black/50 text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 font-light"
                        />
                      </div>
                      <Button className="font-light px-8 py-3 rounded-xl transition-all duration-300 bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-500 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-105">
                        Generate Pitch Deck
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Card */}
            {founderProfile && (
              <Card className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500 animate-slide-in-right">
                <CardHeader>
                  <CardTitle className="text-xl font-light text-white flex items-center">
                    <Avatar className="w-8 h-8 mr-3 ring-2 ring-amber-400/50">
                      <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-500 text-black font-light text-sm">
                        {founderProfile.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'F'}
                      </AvatarFallback>
                    </Avatar>
                    Founder Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-1">Name</h4>
                      <p className="text-white font-light">{founderProfile.user?.name || 'Not set'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-1">Email</h4>
                      <p className="text-white font-light text-sm">{founderProfile.user?.email || 'Not set'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-1">Companies Founded</h4>
                      <p className="text-amber-400 font-light">{founderProfile.company_count || 0}</p>
                    </div>
                    {founderProfile.bio && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-1">Bio</h4>
                        <p className="text-gray-300 font-light text-sm leading-relaxed">{founderProfile.bio}</p>
                      </div>
                    )}
                    {founderProfile.cofounders && founderProfile.cofounders.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Co-founders</h4>
                        <div className="space-y-1">
                          {founderProfile.cofounders.map((cofounder: string, index: number) => (
                            <div key={index} className="text-sm text-gray-300 font-light">
                              • {cofounder}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Companies Card */}
            {companies.length > 0 && (
              <Card className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500 animate-slide-in-right" style={{ animationDelay: "100ms" }}>
                <CardHeader>
                  <CardTitle className="text-xl font-light text-white">Your Companies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {companies.map((company: any, index: number) => (
                    <div key={company.id} className="p-4 border border-amber-500/20 rounded-xl bg-black/30 hover:bg-black/50 transition-all duration-300">
                      <div className="space-y-2">
                        <h4 className="text-white font-medium">{company.name}</h4>
                        {company.description && (
                          <p className="text-gray-400 text-sm font-light">{company.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs">
                          {company.industry && (
                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-light">
                              {company.industry}
                            </Badge>
                          )}
                          {company.stage && (
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 font-light">
                              {company.stage}
                            </Badge>
                          )}
                          {company.valuation && (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 font-light">
                              ${company.valuation}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Previous Validations Card */}
            {validations.length > 0 && (
              <Card className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500 animate-slide-in-right" style={{ animationDelay: "200ms" }}>
                <CardHeader>
                  <CardTitle className="text-xl font-light text-white flex items-center">
                    <Lightbulb className="mr-3 h-5 w-5 text-amber-400" />
                    Previous Validations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {validations.map((validation: any, index: number) => (
                    <div key={validation.id} className="p-4 border border-amber-500/20 rounded-xl bg-black/30 hover:bg-black/50 transition-all duration-300">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-white font-light text-sm leading-relaxed line-clamp-3">
                              {validation.idea_text}
                            </p>
                          </div>
                          {validation.score && (
                            <div className="ml-3 flex-shrink-0">
                              <div className={`text-center px-3 py-1 rounded-full border ${
                                validation.score >= 7 
                                  ? 'border-green-500/30 bg-green-500/10 text-green-400' 
                                  : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                              }`}>
                                <div className="text-lg font-bold">{validation.score}</div>
                                <div className="text-xs">Score</div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {validation.company && (
                          <div className="flex items-center text-xs text-gray-400">
                            <span className="mr-2">Company:</span>
                            <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 font-light text-xs">
                              {validation.company.name}
                            </Badge>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{new Date(validation.created_at).toLocaleDateString()}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-6 px-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                            onClick={() => {
                              setPerplexityResult(validation.perplexity_response || validation.validation_result)
                              setIdeaScore(validation.score)
                              setShowScore(!!validation.score)
                              setValidationComplete(true)
                              setIdeaText(validation.idea_text)
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500 animate-slide-in-right">
              <CardHeader>
                <CardTitle className="text-xl font-light text-white">Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-3 text-gray-300 font-light">
                    <span>Startup Journey</span>
                    <span className="text-amber-400">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full animate-progress-fill transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: CheckCircle, text: "Idea validated", completed: validationComplete },
                    {
                      icon: cofounderResults.length > 0 ? CheckCircle : Clock,
                      text: "Find co-founder",
                      completed: cofounderResults.length > 0,
                    },
                    { icon: Clock, text: "Connect with investors", completed: false },
                    { icon: Clock, text: "Create pitch deck", completed: false },
                  ].map((item, index) => (
                    <div
                      key={item.text}
                      className={`flex items-center text-sm font-light animate-slide-in transition-all duration-300 ${item.completed ? "text-white" : "text-gray-400"}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <item.icon
                        className={`h-4 w-4 mr-3 transition-colors duration-300 ${item.completed ? "text-amber-400" : "text-gray-500"}`}
                      />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card
              className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500 animate-slide-in-right"
              style={{ animationDelay: "200ms" }}
            >
              <CardHeader>
                <CardTitle className="text-xl font-light text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className={`w-full justify-start border rounded-xl transition-all duration-300 font-light animate-slide-in ${
                    ideaScore && ideaScore >= 7
                      ? 'border-green-500/60 bg-green-500/10 text-green-300 hover:text-white hover:bg-green-500/20'
                      : 'border-amber-500/20 bg-black/30 text-gray-300 hover:text-white hover:bg-amber-500/10'
                  }`}
                  style={{ animationDelay: `0ms` }}
                  onClick={() => setShowCompanyModal(true)}
                >
                  {ideaScore && ideaScore >= 7 ? '🚀 Create Company (Recommended)' : '+ Create Company'}
                </Button>
                {[
                  { icon: Target, text: "Market Research", onClick: () => {} },
                  { 
                    icon: Users, 
                    text: "Browse Co-founders", 
                    onClick: async () => {
                      setJobseekersLoading(true)
                      try {
                        const response = await fetch('/api/jobseeker?limit=10')
                        if (response.ok) {
                          const data = await response.json()
                          const cofounders = data.jobseekers.map((jobseeker: any) => ({
                            name: `${jobseeker.first_name || ''} ${jobseeker.last_name || ''}`.trim() || jobseeker.user?.name || 'Unknown',
                            avatar: jobseeker.profile_picture_url || "/placeholder.svg",
                            title: `${jobseeker.experience_level || 'Professional'}, ${jobseeker.current_status || 'Available'}`,
                            skills: jobseeker.skills?.slice(0, 3) || ['Professional'],
                            compatibility: Math.floor(Math.random() * 20) + 80,
                            email: jobseeker.user?.email,
                            location: `${jobseeker.city || ''} ${jobseeker.country || ''}`.trim() || 'Location not specified',
                            bio: jobseeker.bio || 'No bio available'
                          }))
                          setJobseekers(cofounders)
                          setCofounderResults(cofounders.slice(0, 6))
                          toast({ title: "Success", description: `Found ${cofounders.length} potential co-founders!` })
                        }
                      } catch (error) {
                        console.error('Error browsing co-founders:', error)
                        toast({ title: "Error", description: "Failed to browse co-founders", variant: "destructive" })
                      } finally {
                        setJobseekersLoading(false)
                      }
                    }
                  },
                  { icon: FileText, text: "Business Plan Template", onClick: () => {} },
                ].map((action, index) => (
                  <Button
                    key={action.text}
                    variant="outline"
                    onClick={action.onClick}
                    className="w-full justify-start border border-amber-500/20 rounded-xl transition-all duration-300 hover:border-amber-500/60 bg-black/30 text-gray-300 hover:text-white font-light hover:bg-amber-500/10 animate-slide-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <action.icon className="mr-3 h-4 w-4 text-amber-400" />
                    {action.text}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card
              className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500 animate-slide-in-right"
              style={{ animationDelay: "400ms" }}
            >
              <CardHeader>
                <CardTitle className="text-xl font-light text-white">Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-sm">
                  <h4 className="font-light mb-3 text-gray-300 tracking-wide">Recommended Reading</h4>
                  <ul className="space-y-2 text-gray-400 font-light">
                    {["The Lean Startup", "Zero to One", "The Mom Test"].map((book, index) => (
                      <li
                        key={book}
                        className="animate-fade-in hover:text-amber-400 transition-colors duration-300 cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        • {book}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-sm">
                  <h4 className="font-light mb-3 text-gray-300 tracking-wide">Upcoming Events</h4>
                  <ul className="space-y-2 text-gray-400 font-light">
                    {["Startup Pitch Night", "Founder Meetup", "Investor Demo Day"].map((event, index) => (
                      <li
                        key={event}
                        className="animate-fade-in hover:text-amber-400 transition-colors duration-300 cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        • {event}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Dialog open={showCompanyModal} onOpenChange={setShowCompanyModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Company</DialogTitle>
          </DialogHeader>
          <form ref={formRef} onSubmit={handleCreateCompany} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input name="name" value={companyForm.name} onChange={handleCompanyChange} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea name="description" value={companyForm.description} onChange={handleCompanyChange} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input name="industry" value={companyForm.industry} onChange={handleCompanyChange} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stage">Stage</Label>
                <Input name="stage" value={companyForm.stage} onChange={handleCompanyChange} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="level">Level</Label>
                <Input name="level" value={companyForm.level} onChange={handleCompanyChange} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valuation">Valuation</Label>
                <Input name="valuation" value={companyForm.valuation} onChange={handleCompanyChange} type="number" min="0" step="any" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="match">Match</Label>
                <Input name="match" value={companyForm.match} onChange={handleCompanyChange} type="number" min="0" max="100" step="any" className="mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="sector">Sector</Label>
              <Input name="sector" value={companyForm.sector} onChange={handleCompanyChange} className="mt-1" />
            </div>
            {companyError && <div className="text-red-400 text-sm">{companyError}</div>}
            <DialogFooter>
              <Button type="submit" disabled={companyLoading} className="bg-amber-500 text-black hover:bg-amber-600">
                {companyLoading ? "Creating..." : "Create Company"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={showFounderModal} onOpenChange={setShowFounderModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Founder Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFounderDetailsSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input name="name" value={founderDetails.name} onChange={handleFounderDetailsChange} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input name="email" type="email" value={founderDetails.email} onChange={handleFounderDetailsChange} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="companyCount">Number of Companies Founded</Label>
              <Input name="companyCount" type="number" min="0" value={founderDetails.companyCount} onChange={handleFounderDetailsChange} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="cofounders">Co-founder List (one per line)</Label>
              <Textarea name="cofounders" value={founderDetails.cofounders} onChange={handleFounderDetailsChange} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="bio">Bio/About</Label>
              <Textarea name="bio" value={founderDetails.bio} onChange={handleFounderDetailsChange} placeholder="Tell us about yourself and your entrepreneurial journey..." className="mt-1" />
            </div>
            {founderError && <div className="text-red-400 text-sm">{founderError}</div>}
            <DialogFooter>
              <Button type="submit" disabled={founderLoading} className="bg-amber-500 text-black hover:bg-amber-600">
                {founderLoading ? "Saving..." : "Save Details"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
