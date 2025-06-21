/*eslint-disable*/
"use client"

import { useState, useEffect } from "react"
import { useUser } from "@civic/auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, User, Building, DollarSign, Target, Globe, Linkedin, Mail, Phone, Save, Edit } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function InvestorProfilePage() {
  const { user, signOut } = useUser()
  const router = useRouter()
  const [investorProfile, setInvestorProfile] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
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
    linkedin: "",
    phone: "",
    location: "",
    aum: "", // Assets Under Management
    notable_investments: ""
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState(false)

  // Load investor profile
  useEffect(() => {
    const loadInvestorProfile = async () => {
      if (!user?.username) return
      
      setLoading(true)
      try {
        const response = await fetch(`/api/investor/profile?civicId=${user.username}`)
        if (response.ok) {
          const data = await response.json()
          setInvestorProfile(data.profile)
          
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
              linkedin: data.profile.linkedin || "",
              phone: data.profile.phone || "",
              location: data.profile.location || "",
              aum: data.profile.aum?.toString() || "",
              notable_investments: data.profile.notable_investments || ""
            })
          } else {
            setIsEditing(true) // Auto-enter edit mode if no profile exists
          }
        }
      } catch (error) {
        console.error("Error loading investor profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadInvestorProfile()
  }, [user?.username])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.username) return

    setFormLoading(true)
    setFormError(null)
    setFormSuccess(false)
    
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
          total_investments: parseInt(profileForm.total_investments) || null,
          aum: parseFloat(profileForm.aum) || null
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setFormError(data.error || "Failed to save profile.")
      } else {
        const data = await res.json()
        setInvestorProfile(data.profile)
        setIsEditing(false)
        setFormSuccess(true)
        setTimeout(() => setFormSuccess(false), 3000)
      }
    } catch (e: any) {
      setFormError(e.message || "Failed to save profile.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffcb74]"></div>
      </div>
    )
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
              <div className="flex items-center space-x-4">
                <Link href="/dashboard/investor" className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: "#f6f6f6" }}>
                    Investor Profile
                  </h1>
                  <p className="text-gray-300">Manage your investor information</p>
                </div>
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
                Investor Profile
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="bg-transparent border-[#ffcb74] text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300"
              >
                <User className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Success/Error Messages */}
        {formSuccess && (
          <Alert className="mb-6 border-green-500/50 bg-green-500/10">
            <AlertDescription className="text-green-400">
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}
        
        {formError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {formError}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <Card
              className="backdrop-blur-sm border"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 203, 116, 0.2)",
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between" style={{ color: "#ffcb74" }}>
                  <span className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Profile Overview
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-transparent border-[#ffcb74] text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {investorProfile ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-400">Firm Name</p>
                      <p className="font-medium text-gray-200">{investorProfile.firm_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Investment Focus</p>
                      <p className="font-medium text-gray-200">{investorProfile.investment_focus || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Check Size Range</p>
                      <p className="font-medium" style={{ color: "#ffcb74" }}>
                        ${(investorProfile.check_size_min || 0).toLocaleString()} - ${(investorProfile.check_size_max || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Portfolio Companies</p>
                      <p className="font-medium" style={{ color: "#4ade80" }}>
                        {investorProfile.portfolio_companies || 0} companies
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total Investments</p>
                      <p className="font-medium text-gray-200">{investorProfile.total_investments || 0}</p>
                    </div>
                    {investorProfile.stage_preference && (
                      <div>
                        <p className="text-sm text-gray-400">Stage Preference</p>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {investorProfile.stage_preference}
                        </Badge>
                      </div>
                    )}
                    {investorProfile.sector_preference && (
                      <div>
                        <p className="text-sm text-gray-400">Sector Preference</p>
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          {investorProfile.sector_preference}
                        </Badge>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No profile created yet</p>
                    <p className="text-gray-500 text-sm">Create your profile to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {investorProfile && (
              <Card
                className="mt-6 backdrop-blur-sm border"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(255, 203, 116, 0.2)",
                }}
              >
                <CardHeader>
                  <CardTitle className="text-lg" style={{ color: "#ffcb74" }}>
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">AUM</span>
                    <span className="font-bold text-xl" style={{ color: "#ffcb74" }}>
                      ${(investorProfile.aum || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Active Deals</span>
                    <span className="font-bold text-xl" style={{ color: "#4ade80" }}>
                      3
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Pipeline Value</span>
                    <span className="font-bold text-xl" style={{ color: "#ffcb74" }}>
                      $2.5M
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Profile Form/Details */}
          <div className="lg:col-span-2">
            <Card
              className="backdrop-blur-sm border"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 203, 116, 0.2)",
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: "#ffcb74" }}>
                  {isEditing ? 'Edit Profile Details' : 'Profile Details'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
                        <Building className="h-5 w-5 mr-2" />
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firm_name">Firm Name *</Label>
                          <Input 
                            name="firm_name" 
                            value={profileForm.firm_name} 
                            onChange={handleFormChange} 
                            required 
                            className="mt-1" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input 
                            name="location" 
                            value={profileForm.location} 
                            onChange={handleFormChange} 
                            placeholder="e.g., San Francisco, CA"
                            className="mt-1" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="investment_focus">Investment Focus</Label>
                          <Input 
                            name="investment_focus" 
                            value={profileForm.investment_focus} 
                            onChange={handleFormChange} 
                            placeholder="e.g., SaaS, FinTech, AI"
                            className="mt-1" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="aum">Assets Under Management ($)</Label>
                          <Input 
                            name="aum" 
                            type="number"
                            value={profileForm.aum} 
                            onChange={handleFormChange} 
                            placeholder="10000000"
                            className="mt-1" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Investment Preferences */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        Investment Preferences
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="stage_preference">Stage Preference</Label>
                          <Input 
                            name="stage_preference" 
                            value={profileForm.stage_preference} 
                            onChange={handleFormChange} 
                            placeholder="e.g., Seed, Series A, Series B"
                            className="mt-1" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="sector_preference">Sector Preference</Label>
                          <Input 
                            name="sector_preference" 
                            value={profileForm.sector_preference} 
                            onChange={handleFormChange} 
                            placeholder="e.g., B2B, B2C, Enterprise"
                            className="mt-1" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="check_size_min">Min Check Size ($)</Label>
                          <Input 
                            name="check_size_min" 
                            type="number"
                            value={profileForm.check_size_min} 
                            onChange={handleFormChange} 
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
                            onChange={handleFormChange} 
                            placeholder="1000000"
                            className="mt-1" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Portfolio & Experience */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Portfolio & Experience
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="portfolio_companies">Portfolio Companies</Label>
                          <Input 
                            name="portfolio_companies" 
                            type="number"
                            value={profileForm.portfolio_companies} 
                            onChange={handleFormChange} 
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
                            onChange={handleFormChange} 
                            placeholder="50"
                            className="mt-1" 
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label htmlFor="notable_investments">Notable Investments</Label>
                        <Textarea 
                          name="notable_investments" 
                          value={profileForm.notable_investments} 
                          onChange={handleFormChange} 
                          placeholder="List your most notable portfolio companies and exits..."
                          className="mt-1" 
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Bio & Criteria */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-white">About & Criteria</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea 
                            name="bio" 
                            value={profileForm.bio} 
                            onChange={handleFormChange} 
                            placeholder="Tell us about your investment philosophy and experience..."
                            className="mt-1" 
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="investment_criteria">Investment Criteria</Label>
                          <Textarea 
                            name="investment_criteria" 
                            value={profileForm.investment_criteria} 
                            onChange={handleFormChange} 
                            placeholder="What criteria do you use when evaluating startups?"
                            className="mt-1" 
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
                        <Mail className="h-5 w-5 mr-2" />
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contact_email">Contact Email</Label>
                          <Input 
                            name="contact_email" 
                            type="email"
                            value={profileForm.contact_email} 
                            onChange={handleFormChange} 
                            placeholder="investor@firm.com"
                            className="mt-1" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input 
                            name="phone" 
                            value={profileForm.phone} 
                            onChange={handleFormChange} 
                            placeholder="+1 (555) 123-4567"
                            className="mt-1" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input 
                            name="website" 
                            value={profileForm.website} 
                            onChange={handleFormChange} 
                            placeholder="https://yourfirm.com"
                            className="mt-1" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="linkedin">LinkedIn Profile</Label>
                          <Input 
                            name="linkedin" 
                            value={profileForm.linkedin} 
                            onChange={handleFormChange} 
                            placeholder="https://linkedin.com/in/yourprofile"
                            className="mt-1" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-600">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="bg-transparent border-gray-500 text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={formLoading} 
                        className="bg-[#ffcb74] text-black hover:bg-[#ffcb74]/80"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {formLoading ? "Saving..." : "Save Profile"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {investorProfile ? (
                      <>
                        {/* Bio Section */}
                        {investorProfile.bio && (
                          <div>
                            <h3 className="text-lg font-semibold mb-3 text-white">About</h3>
                            <p className="text-gray-300 leading-relaxed">{investorProfile.bio}</p>
                          </div>
                        )}

                        {/* Investment Criteria */}
                        {investorProfile.investment_criteria && (
                          <div>
                            <h3 className="text-lg font-semibold mb-3 text-white">Investment Criteria</h3>
                            <p className="text-gray-300 leading-relaxed">{investorProfile.investment_criteria}</p>
                          </div>
                        )}

                        {/* Notable Investments */}
                        {investorProfile.notable_investments && (
                          <div>
                            <h3 className="text-lg font-semibold mb-3 text-white">Notable Investments</h3>
                            <p className="text-gray-300 leading-relaxed">{investorProfile.notable_investments}</p>
                          </div>
                        )}

                        {/* Contact Information */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-white">Contact Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {investorProfile.contact_email && (
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <a href={`mailto:${investorProfile.contact_email}`} className="text-blue-400 hover:text-blue-300">
                                  {investorProfile.contact_email}
                                </a>
                              </div>
                            )}
                            {investorProfile.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-300">{investorProfile.phone}</span>
                              </div>
                            )}
                            {investorProfile.website && (
                              <div className="flex items-center space-x-2">
                                <Globe className="h-4 w-4 text-gray-400" />
                                <a href={investorProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                  {investorProfile.website}
                                </a>
                              </div>
                            )}
                            {investorProfile.linkedin && (
                              <div className="flex items-center space-x-2">
                                <Linkedin className="h-4 w-4 text-gray-400" />
                                <a href={investorProfile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                  LinkedIn Profile
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">No Profile Information</h3>
                        <p className="text-gray-400 mb-4">Create your investor profile to showcase your firm and investment focus.</p>
                        <Button
                          onClick={() => setIsEditing(true)}
                          className="bg-[#ffcb74] text-black hover:bg-[#ffcb74]/80"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Create Profile
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 