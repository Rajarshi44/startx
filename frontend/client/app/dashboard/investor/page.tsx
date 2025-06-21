"use client"

import { useState, useEffect } from "react"
import { useUser } from "@civic/auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { TrendingUp, Users, Calendar, BarChart3, Target, Zap, LogOut, User } from "lucide-react"

import Portfolio from "@/components/sections/investor/Portfolio"
import Analytics from "@/components/sections/investor/Analytics"
import Preferences from "@/components/sections/investor/Preferences"
import Link from "next/link"

export default function InvestorDashboard() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState("dealflow")
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [investorProfile, setInvestorProfile] = useState<any>(null)
  const [dealFlow, setDealFlow] = useState<any[]>([])
  const [investments, setInvestments] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [profileLoading, setProfileLoading] = useState(true)
  const [dealFlowLoading, setDealFlowLoading] = useState(false)
  const [companiesLoading, setCompaniesLoading] = useState(false)
  const [profileForm, setProfileForm] = useState({
    firm_name: "",
    investment_focus: "",
    stage_preference: "",
    sector_preference: "",
    check_size_min: "",
    check_size_max: "",
    portfolio_companies: "",
    total_investments: "",
    bio: "",
    investment_criteria: "",
    contact_email: "",
    website: "",
    linkedin: ""
  })
  const [profileFormLoading, setProfileFormLoading] = useState(false)
  const [profileFormError, setProfileFormError] = useState<string | null>(null)

  // Load investor profile and data
  useEffect(() => {
    const loadInvestorData = async () => {
      if (!user?.username) return
      
      setProfileLoading(true)
      try {
        const response = await fetch(`/api/investor/profile?civicId=${user.username}`)
        if (response.ok) {
          const data = await response.json()
          setInvestorProfile(data.profile)
          setDealFlow(data.dealFlow || [])
          setInvestments(data.investments || [])
          
          if (data.profile) {
            setProfileForm({
              firm_name: data.profile.firm_name || "",
              investment_focus: data.profile.investment_focus || "",
              stage_preference: data.profile.stage_preference || "",
              sector_preference: data.profile.sector_preference || "",
              check_size_min: data.profile.check_size_min?.toString() || "",
              check_size_max: data.profile.check_size_max?.toString() || "",
              portfolio_companies: data.profile.portfolio_companies?.toString() || "",
              total_investments: data.profile.total_investments?.toString() || "",
              bio: data.profile.bio || "",
              investment_criteria: data.profile.investment_criteria || "",
              contact_email: data.profile.contact_email || "",
              website: data.profile.website || "",
              linkedin: data.profile.linkedin || ""
            })
          } else {
            setShowProfileModal(true)
          }
        }
      } catch (error) {
        console.error("Error loading investor data:", error)
        setShowProfileModal(true)
      } finally {
        setProfileLoading(false)
      }
    }

    loadInvestorData()
  }, [user?.username])

  // Load companies for deal flow
  useEffect(() => {
    const loadCompanies = async () => {
      setCompaniesLoading(true)
      try {
        const response = await fetch('/api/company')
        if (response.ok) {
          const data = await response.json()
          setCompanies(data.companies || [])
        }
      } catch (error) {
        console.error("Error loading companies:", error)
      } finally {
        setCompaniesLoading(false)
      }
    }

    loadCompanies()
  }, [])

  // Function to add company to deal flow
  const addToDealFlow = async (company: any) => {
    if (!user?.username) return

    try {
      const response = await fetch('/api/investor/deal-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          civicId: user.username,
          companyId: company.id,
          status: 'new'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setDealFlow(prev => [data.deal, ...prev])
        // Remove from companies list or mark as added
        setCompanies(prev => prev.map(c => 
          c.id === company.id ? { ...c, inDealFlow: true } : c
        ))
      }
    } catch (error) {
      console.error("Error adding to deal flow:", error)
    }
  }

  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.username) return

    setProfileFormLoading(true)
    setProfileFormError(null)
    
    try {
      const res = await fetch("/api/investor/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          civicId: user.username,
          ...profileForm,
          check_size_min: parseFloat(profileForm.check_size_min) || null,
          check_size_max: parseFloat(profileForm.check_size_max) || null,
          portfolio_companies: parseInt(profileForm.portfolio_companies) || null,
          total_investments: parseInt(profileForm.total_investments) || null
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setProfileFormError(data.error || "Failed to save profile.")
      } else {
        const data = await res.json()
        setInvestorProfile(data.profile)
        setShowProfileModal(false)
      }
    } catch (e: any) {
      setProfileFormError(e.message || "Failed to save profile.")
    } finally {
      setProfileFormLoading(false)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dealflow":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ color: "#f6f6f6" }}>
                Deal Flow
              </h2>
              <Button className="bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] transition-all duration-300">
                View All Deals
              </Button>
            </div>

            {/* Current Deal Flow */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4" style={{ color: "#ffcb74" }}>
                Current Deal Flow ({dealFlow.length})
              </h3>
              <div className="grid gap-6">
                {dealFlow.map((deal) => (
                  <Card
                    key={deal.id}
                    className="backdrop-blur-sm border hover:border-opacity-60 transition-all duration-300"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(255, 203, 116, 0.2)",
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl" style={{ color: "#f6f6f6" }}>
                            {deal.company?.name || 'Unknown Company'}
                          </CardTitle>
                          <p className="text-gray-300 mt-1">{deal.company?.description || 'No description available'}</p>
                        </div>
                        <Badge
                          className={`${
                            deal.status === "interested"
                              ? "bg-red-500/20 text-red-400"
                              : deal.status === "new"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {deal.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Industry</p>
                          <p className="font-medium" style={{ color: "#ffcb74" }}>
                            {deal.company?.industry || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Stage</p>
                          <p className="font-medium text-gray-200">{deal.company?.stage || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Valuation</p>
                          <p className="font-medium text-gray-200">
                            {deal.company?.valuation ? `$${deal.company.valuation.toLocaleString()}` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Investment</p>
                          <p className="font-medium" style={{ color: "#4ade80" }}>
                            {deal.investment_amount ? `$${deal.investment_amount.toLocaleString()}` : 'TBD'}
                          </p>
                        </div>
                      </div>
                      {deal.notes && (
                        <p className="text-sm text-gray-300 mb-4">Notes: {deal.notes}</p>
                      )}
                      <div className="flex space-x-3">
                        <Button
                          size="sm"
                          className="bg-transparent border-[#ffcb74] text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300"
                          variant="outline"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="text-white hover:opacity-90 transition-all duration-300"
                          style={{ backgroundColor: "#111111" }}
                        >
                          Schedule Meeting
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {dealFlow.length === 0 && (
                  <Card
                    className="backdrop-blur-sm border text-center py-12"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(255, 203, 116, 0.2)",
                    }}
                  >
                    <CardContent>
                      <p className="text-gray-400">No deals in your pipeline yet. Browse companies below to get started.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Available Companies */}
            <div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: "#ffcb74" }}>
                Available Companies
              </h3>
              {companiesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffcb74]"></div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {companies.filter(company => !company.inDealFlow).map((company) => (
                    <Card
                      key={company.id}
                      className="backdrop-blur-sm border hover:border-opacity-60 transition-all duration-300"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        borderColor: "rgba(255, 203, 116, 0.1)",
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold" style={{ color: "#f6f6f6" }}>
                              {company.name}
                            </h4>
                            <p className="text-gray-300 text-sm mt-1">{company.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                              <span>{company.industry}</span>
                              <span>•</span>
                              <span>{company.stage}</span>
                              {company.valuation && (
                                <>
                                  <span>•</span>
                                  <span>${company.valuation.toLocaleString()}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addToDealFlow(company)}
                            className="bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] transition-all duration-300"
                          >
                            Add to Pipeline
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {companies.filter(company => !company.inDealFlow).length === 0 && (
                    <Card
                      className="backdrop-blur-sm border text-center py-8"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        borderColor: "rgba(255, 203, 116, 0.2)",
                      }}
                    >
                      <CardContent>
                        <p className="text-gray-400">No new companies available at the moment.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      case "portfolio":
        return <Portfolio />
      case "analytics":
        return <Analytics />
      case "preferences":
        return <Preferences />
      default:
        return <div>Select a tab</div>
    }
  }

  return (
    <div className="min-h-screen bg-black" style={{ color: "#f6f6f6" }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: "rgba(255, 203, 116, 0.2)" }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
                <span style={{ color: "#f6f6f6" }}>Startup</span>
                <span style={{ color: "#ffcb74" }}>Hub</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "#f6f6f6" }}>
                  Investor Dashboard
                </h1>
                <p className="text-gray-300">Discover and invest in promising startups</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                className="px-3 py-1"
                style={{
                  backgroundColor: "rgba(255, 203, 116, 0.2)",
                  color: "#ffcb74",
                  border: "1px solid rgba(255, 203, 116, 0.3)",
                }}
              >
                Investor Portal
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfileModal(true)}
                className="bg-transparent border-[#ffcb74] text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300 mr-2"
              >
                <User className="w-4 h-4 mr-2" />
                {investorProfile ? 'Edit Profile' : 'Create Profile'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-[#ffcb74] text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Navigation */}
            <Card
              className="backdrop-blur-sm border"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 203, 116, 0.2)",
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: "#ffcb74" }}>
                  Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={() => setActiveTab("dealflow")}
                  className={`w-full flex items-center justify-start px-3 py-2 rounded-md transition-all duration-300 ${
                    activeTab === "dealflow"
                      ? "bg-[#ffcb74] text-black"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Deal Flow
                </button>
                <button
                  onClick={() => setActiveTab("portfolio")}
                  className={`w-full flex items-center justify-start px-3 py-2 rounded-md transition-all duration-300 ${
                    activeTab === "portfolio"
                      ? "bg-[#ffcb74] text-black"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Portfolio
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`w-full flex items-center justify-start px-3 py-2 rounded-md transition-all duration-300 ${
                    activeTab === "analytics"
                      ? "bg-[#ffcb74] text-black"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab("preferences")}
                  className={`w-full flex items-center justify-start px-3 py-2 rounded-md transition-all duration-300 ${
                    activeTab === "preferences"
                      ? "bg-[#ffcb74] text-black"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Preferences
                </button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card
              className="backdrop-blur-sm border"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 203, 116, 0.2)",
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: "#ffcb74" }}>
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">New Deals</span>
                  <span className="font-semibold" style={{ color: "#ffcb74" }}>
                    {dealFlow.filter(deal => {
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return new Date(deal.created_at) >= weekAgo
                    }).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Total Pipeline</span>
                  <span className="font-semibold" style={{ color: "#ffcb74" }}>
                    {dealFlow.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Companies Available</span>
                  <span className="font-semibold" style={{ color: "#ffcb74" }}>
                    {companies.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Investments</span>
                  <span className="font-semibold" style={{ color: "#ffcb74" }}>
                    {investments.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Investor Profile */}
            {investorProfile && (
              <Card
                className="backdrop-blur-sm border"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(255, 203, 116, 0.2)",
                }}
              >
                <CardHeader>
                  <CardTitle className="text-lg" style={{ color: "#ffcb74" }}>
                    Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Firm</p>
                    <p className="font-medium text-gray-200">{investorProfile.firm_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Focus</p>
                    <p className="font-medium text-gray-200">{investorProfile.investment_focus || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Check Size</p>
                    <p className="font-medium text-gray-200">
                      ${investorProfile.check_size_min?.toLocaleString() || '0'} - ${investorProfile.check_size_max?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Portfolio</p>
                    <p className="font-medium" style={{ color: "#ffcb74" }}>
                      {investorProfile.portfolio_companies || 0} companies
                    </p>
                  </div>
                  {investorProfile.stage_preference && (
                    <div>
                      <p className="text-sm text-gray-400">Stage Preference</p>
                      <p className="font-medium text-gray-200">{investorProfile.stage_preference}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Trending Sectors */}
            <Card
              className="backdrop-blur-sm border"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 203, 116, 0.2)",
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: "#ffcb74" }}>
                  Trending Sectors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { sector: "AI/ML", growth: "+15%", color: "#4ade80" },
                    { sector: "Climate Tech", growth: "+12%", color: "#4ade80" },
                    { sector: "Web3", growth: "-5%", color: "#ef4444" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{item.sector}</span>
                      <span className="text-sm font-medium" style={{ color: item.color }}>
                        {item.growth}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card
              className="backdrop-blur-sm border"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 203, 116, 0.2)",
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: "#ffcb74" }}>
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 mt-1" style={{ color: "#3b82f6" }} />
                    <div>
                      <div className="text-sm font-medium text-gray-200">FlowAI Pitch</div>
                      <div className="text-xs text-gray-400">Tomorrow, 2:00 PM</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 mt-1" style={{ color: "#8b5cf6" }} />
                    <div>
                      <div className="text-sm font-medium text-gray-200">VC Meetup</div>
                      <div className="text-xs text-gray-400">Friday, 6:00 PM</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 mt-1" style={{ color: "#10b981" }} />
                    <div>
                      <div className="text-sm font-medium text-gray-200">Portfolio Review</div>
                      <div className="text-xs text-gray-400">Next Monday</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card
              className="backdrop-blur-sm border"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 203, 116, 0.2)",
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center text-lg" style={{ color: "#ffcb74" }}>
                  <Zap className="mr-2 h-4 w-4" style={{ color: "#fbbf24" }} />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(251, 191, 36, 0.1)" }}>
                    <div className="text-sm font-medium mb-1" style={{ color: "#fbbf24" }}>
                      High Potential Deal
                    </div>
                    <div className="text-xs text-gray-300">FlowAI matches 95% of your criteria</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}>
                    <div className="text-sm font-medium mb-1" style={{ color: "#3b82f6" }}>
                      Market Trend
                    </div>
                    <div className="text-xs text-gray-300">AI/ML startups seeing 20% valuation increase</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">{renderContent()}</div>
        </div>
      </div>

      {/* Investor Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {investorProfile ? 'Edit Investor Profile' : 'Create Investor Profile'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firm_name">Firm Name *</Label>
                <Input 
                  name="firm_name" 
                  value={profileForm.firm_name} 
                  onChange={handleProfileFormChange} 
                  required 
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="investment_focus">Investment Focus</Label>
                <Input 
                  name="investment_focus" 
                  value={profileForm.investment_focus} 
                  onChange={handleProfileFormChange} 
                  placeholder="e.g., SaaS, FinTech"
                  className="mt-1" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stage_preference">Stage Preference</Label>
                <Input 
                  name="stage_preference" 
                  value={profileForm.stage_preference} 
                  onChange={handleProfileFormChange} 
                  placeholder="e.g., Seed, Series A"
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="sector_preference">Sector Preference</Label>
                <Input 
                  name="sector_preference" 
                  value={profileForm.sector_preference} 
                  onChange={handleProfileFormChange} 
                  placeholder="e.g., B2B, B2C"
                  className="mt-1" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="check_size_min">Min Check Size ($)</Label>
                <Input 
                  name="check_size_min" 
                  type="number"
                  value={profileForm.check_size_min} 
                  onChange={handleProfileFormChange} 
                  placeholder="50000"
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="check_size_max">Max Check Size ($)</Label>
                <Input 
                  name="check_size_max" 
                  type="number"
                  value={profileForm.check_size_max} 
                  onChange={handleProfileFormChange} 
                  placeholder="1000000"
                  className="mt-1" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="portfolio_companies">Portfolio Companies</Label>
                <Input 
                  name="portfolio_companies" 
                  type="number"
                  value={profileForm.portfolio_companies} 
                  onChange={handleProfileFormChange} 
                  placeholder="15"
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="total_investments">Total Investments</Label>
                <Input 
                  name="total_investments" 
                  type="number"
                  value={profileForm.total_investments} 
                  onChange={handleProfileFormChange} 
                  placeholder="50"
                  className="mt-1" 
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                name="bio" 
                value={profileForm.bio} 
                onChange={handleProfileFormChange} 
                placeholder="Tell us about your investment philosophy and experience..."
                className="mt-1" 
              />
            </div>

            <div>
              <Label htmlFor="investment_criteria">Investment Criteria</Label>
              <Textarea 
                name="investment_criteria" 
                value={profileForm.investment_criteria} 
                onChange={handleProfileFormChange} 
                placeholder="What criteria do you use when evaluating startups?"
                className="mt-1" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input 
                  name="contact_email" 
                  type="email"
                  value={profileForm.contact_email} 
                  onChange={handleProfileFormChange} 
                  placeholder="investor@firm.com"
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input 
                  name="website" 
                  value={profileForm.website} 
                  onChange={handleProfileFormChange} 
                  placeholder="https://yourfirm.com"
                  className="mt-1" 
                />
              </div>
            </div>

            <div>
              <Label htmlFor="linkedin">LinkedIn Profile</Label>
              <Input 
                name="linkedin" 
                value={profileForm.linkedin} 
                onChange={handleProfileFormChange} 
                placeholder="https://linkedin.com/in/yourprofile"
                className="mt-1" 
              />
            </div>

            {profileFormError && (
              <div className="text-red-400 text-sm">{profileFormError}</div>
            )}

            <DialogFooter>
              <Button 
                type="submit" 
                disabled={profileFormLoading} 
                className="bg-[#ffcb74] text-black hover:bg-[#ffcb74]/80"
              >
                {profileFormLoading ? "Saving..." : "Save Profile"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
