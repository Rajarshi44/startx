"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useUser } from "@civic/auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Briefcase,
  MessageSquare,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  Sparkles,
  Target,
  TrendingUp,
  Bell,
  Star,
  Camera,
  Upload,
  GraduationCap,
  User,
} from "lucide-react"
import TavusInterviewModal from "@/components/interview/TavusInterviewModal"

export default function JobSeekerDashboard() {
  const { user } = useUser()
  const [isInterviewActive, setIsInterviewActive] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [interviewSessions, setInterviewSessions] = useState<any[]>([])
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [data, setData] = useState({
    // Personal Information
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+1 234 567 8900",
    city: "San Francisco",
    country: "USA",
    dateOfBirth: "1995-06-15",
    gender: "Male",
    languages: ["English", "Spanish", "French"],
    profilePicture: null,

    // Professional Information
    currentStatus: "Experienced Professional",
    experience: "3-5 years",
    education: "Bachelor's Degree",
    university: "Stanford University",
    graduationYear: "2020",
    skills: ["React", "Node.js", "Python", "TypeScript", "AWS", "Docker"],
    resume: null,
    portfolio: "https://johndoe.dev",
    linkedIn: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",

    // Preferences
    interests: ["Software Development", "Web Development", "Machine Learning"],
    careerGoals: ["Senior Developer", "Tech Lead"],
    jobTypes: ["Full-time", "Remote"],
    workModes: ["Remote", "Hybrid"],
    salaryExpectation: "$120,000 - $160,000",
    availability: "2 weeks notice",
    relocate: "Maybe",

    // Additional
    bio: "Passionate full-stack developer with 5 years of experience building scalable web applications. Love working with modern technologies and solving complex problems.",
    achievements: ["AWS Certified", "Led team of 5 developers"],
    certifications: ["AWS Solutions Architect", "Google Cloud Professional"],
  })
  const [showTavusInterview, setShowTavusInterview] = useState(false)

  // Load jobseeker data from API
  useEffect(() => {
    const loadJobSeekerData = async () => {
      // Get civicId from user or localStorage
      const civicId = user?.username || localStorage.getItem("mockCivicId") || `mock_user_${Date.now()}`

      setProfileLoading(true)
      try {
        // Load profile
        const profileRes = await fetch(`/api/jobseeker/profile?civicId=${civicId}`)
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setProfile(profileData.profile)
          setApplications(profileData.applications || [])

          if (profileData.profile) {
            // Update local state with API data
            setData({
              firstName: profileData.profile.first_name || "",
              lastName: profileData.profile.last_name || "",
              email: profileData.profile.user?.email || "",
              phone: profileData.profile.phone || "",
              city: profileData.profile.city || "",
              country: profileData.profile.country || "USA",
              dateOfBirth: profileData.profile.date_of_birth || "",
              gender: profileData.profile.gender || "",
              languages: profileData.profile.languages || ["English"],
              profilePicture: null,
              currentStatus: profileData.profile.current_status || "",
              experience: profileData.profile.experience_level || "",
              education: profileData.profile.education_level || "",
              university: profileData.profile.university || "",
              graduationYear: profileData.profile.graduation_year?.toString() || "",
              skills: profileData.profile.skills || [],
              resume: null,
              portfolio: profileData.profile.portfolio_url || "",
              linkedIn: profileData.profile.linkedin_url || "",
              github: profileData.profile.github_url || "",
              interests: profileData.profile.interests || [],
              careerGoals: profileData.profile.career_goals || [],
              jobTypes: profileData.profile.job_types || [],
              workModes: profileData.profile.work_modes || [],
              salaryExpectation: profileData.profile.salary_expectation || "",
              availability: profileData.profile.availability || "",
              relocate: profileData.profile.willing_to_relocate ? "Yes" : "No",
              bio: profileData.profile.bio || "",
              achievements: profileData.profile.achievements || [],
              certifications: profileData.profile.certifications || [],
            })
          }
        }

        // Load recommended jobs
        const jobsRes = await fetch(`/api/jobs?status=active`)
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json()
          setJobs(jobsData.jobs || [])
        }

        // Load interview sessions
        // Note: Interview sessions API has been removed - using placeholder data
        setInterviewSessions([])
      } catch (error) {
        console.error("Error loading jobseeker data:", error)
      } finally {
        setProfileLoading(false)
      }
    }

    // Also check localStorage for any unsaved changes
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("jobseekerProfile")
      if (stored) {
        setData(JSON.parse(stored))
      }
    }

    loadJobSeekerData()
  }, [user?.username])

  const startInterview = async () => {
    console.log("Starting interview...")
    console.log("User:", user?.username)
    console.log("Is interview active:", isInterviewActive)

    // Check if user is authenticated
    if (!user?.username) {
      console.warn("No user found, checking localStorage for mock ID")
      const mockId = localStorage.getItem("mockCivicId")
      if (!mockId) {
        alert("Please sign in to start an interview")
        return
      }
      console.log("Using mock civic ID:", mockId)
    }

    // For now, just show the placeholder interview system
    setIsInterviewActive(true)
  }

  const handleInterviewComplete = (session: any) => {
    setIsInterviewActive(false)
    // Interview system is being updated
  }

  const handleInterviewClose = () => {
    setIsInterviewActive(false)
  }

  const handleApplyToJob = async (jobId: string) => {
    const civicId = user?.username || localStorage.getItem("mockCivicId") || `mock_user_${Date.now()}`

    try {
      const response = await fetch("/api/jobseeker/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          civicId: civicId,
          jobPostingId: jobId,
          coverLetter: "I am interested in this position and believe my skills would be a great fit.",
        }),
      })

      if (response.ok) {
        alert("Application submitted successfully!")
        // Reload applications
        const appsRes = await fetch(`/api/jobseeker/applications?civicId=${civicId}`)
        if (appsRes.ok) {
          const appsData = await appsRes.json()
          setApplications(appsData.applications || [])
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to submit application")
      }
    } catch (error) {
      console.error("Error applying to job:", error)
      alert("Failed to submit application")
    }
  }

  const handleUpdateProfile = async () => {
    const civicId = user?.username || localStorage.getItem("mockCivicId") || `mock_user_${Date.now()}`

    try {
      const response = await fetch("/api/jobseeker/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          civicId: civicId,
          ...data,
        }),
      })

      if (response.ok) {
        alert("Profile updated successfully!")
        // Save to localStorage as backup
        localStorage.setItem("jobseekerProfile", JSON.stringify(data))
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile")
    }
  }

  const update = (key: string, value: any) => setData((prev) => ({ ...prev, [key]: value }))

  const SelectableCard = ({
    children,
    selected,
    onClick,
    className = "",
  }: {
    children: React.ReactNode
    selected: boolean
    onClick: () => void
    className?: string
  }) => (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
        selected
          ? "border-[#ffcb74] bg-[#ffcb74]/10 shadow-lg ring-2 ring-[#ffcb74]/50"
          : "border-[#ffcb74]/20 bg-[#111111] hover:border-[#ffcb74]/50 hover:shadow-md"
      } ${className}`}
    >
      <CardContent className="p-4 text-[#f6f6f6]">{children}</CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-[#2f2f2f]">
      {/* Header */}
      <header className="bg-[#111111] border-b border-[#ffcb74]/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ffcb74] rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#111111]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#f6f6f6]">JobSeeker Pro Dashboard</h1>
                <p className="text-[#f6f6f6]/70">Your gateway to exciting opportunities</p>
              </div>
            </div>
            <Badge className="bg-[#ffcb74] text-[#111111] hover:bg-[#ffcb74]/80">Active Job Seeker</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-[#111111] border border-[#ffcb74]/20">
                <TabsTrigger
                  value="profile"
                  className="data-[state=active]:bg-[#ffcb74] data-[state=active]:text-[#111111] text-[#f6f6f6]"
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="jobs"
                  className="data-[state=active]:bg-[#ffcb74] data-[state=active]:text-[#111111] text-[#f6f6f6]"
                >
                  Jobs
                </TabsTrigger>
                <TabsTrigger
                  value="interview"
                  className="data-[state=active]:bg-[#ffcb74] data-[state=active]:text-[#111111] text-[#f6f6f6]"
                >
                  Interview
                </TabsTrigger>
                <TabsTrigger
                  value="applications"
                  className="data-[state=active]:bg-[#ffcb74] data-[state=active]:text-[#111111] text-[#f6f6f6]"
                >
                  Applications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                {/* Personal Information */}
                <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-[#f6f6f6]">
                      <Users className="mr-2 h-5 w-5 text-[#ffcb74]" />
                      Personal Information
                    </CardTitle>
                    <CardDescription className="text-[#f6f6f6]/70">Your basic personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-20 h-20 bg-[#ffcb74]/20 rounded-3xl border-4 border-[#ffcb74] shadow-lg flex items-center justify-center overflow-hidden">
                        {data.profilePicture ? (
                          <img
                            src={URL.createObjectURL(data.profilePicture) || "/placeholder.svg" || "/placeholder.svg"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="w-8 h-8 text-[#ffcb74]" />
                        )}
                      </div>
                      <div className="flex gap-3">
                        <label className="cursor-pointer">
                          <Button className="bg-[#111111] hover:bg-[#111111]/80 text-[#f6f6f6] border border-[#ffcb74]">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Photo
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && update("profilePicture", e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">First Name</label>
                        <Input
                          value={data.firstName}
                          onChange={(e) => update("firstName", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">Last Name</label>
                        <Input
                          value={data.lastName}
                          onChange={(e) => update("lastName", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">Email</label>
                        <Input
                          value={data.email}
                          onChange={(e) => update("email", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">Phone</label>
                        <Input
                          value={data.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">City</label>
                        <Input
                          value={data.city}
                          onChange={(e) => update("city", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">Date of Birth</label>
                        <Input
                          type="date"
                          value={data.dateOfBirth}
                          onChange={(e) => update("dateOfBirth", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">Gender</label>
                        <Input
                          value={data.gender}
                          onChange={(e) => update("gender", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">Languages</label>
                      <div className="flex flex-wrap gap-2">
                        {data.languages.map((lang, index) => (
                          <Badge key={index} className="bg-[#ffcb74]/20 text-[#ffcb74]">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Information */}
                <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-[#f6f6f6]">
                      <GraduationCap className="mr-2 h-5 w-5 text-[#ffcb74]" />
                      Professional Background
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">Current Status</label>
                        <Input
                          value={data.currentStatus}
                          onChange={(e) => update("currentStatus", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">Experience Level</label>
                        <Input
                          value={data.experience}
                          onChange={(e) => update("experience", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">Education</label>
                        <Input
                          value={data.education}
                          onChange={(e) => update("education", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">University</label>
                        <Input
                          value={data.university}
                          onChange={(e) => update("university", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">Skills</label>
                      <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill, index) => (
                          <Badge key={index} className="bg-[#ffcb74]/20 text-[#ffcb74]">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">Portfolio URL</label>
                        <Input
                          value={data.portfolio}
                          onChange={(e) => update("portfolio", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">LinkedIn</label>
                        <Input
                          value={data.linkedIn}
                          onChange={(e) => update("linkedIn", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">Professional Summary</label>
                      <Textarea
                        value={data.bio}
                        onChange={(e) => update("bio", e.target.value)}
                        className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] min-h-[100px]"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">Salary Expectation</label>
                      <Input
                        value={data.salaryExpectation}
                        onChange={(e) => update("salaryExpectation", e.target.value)}
                        className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                      />
                    </div>

                    <Button
                      onClick={handleUpdateProfile}
                      className="bg-[#111111] hover:bg-[#111111]/80 text-[#f6f6f6] border border-[#ffcb74]"
                    >
                      Update Profile
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="jobs" className="space-y-6">
                <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-[#f6f6f6]">
                      <Briefcase className="mr-2 h-5 w-5 text-[#ffcb74]" />
                      Recommended Jobs
                    </CardTitle>
                    <CardDescription className="text-[#f6f6f6]/70">
                      Jobs matched to your skills and preferences
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div className="space-y-4">
                  {jobs.slice(0, 6).map((job, index) => {
                    const matchScore = Math.floor(Math.random() * 20) + 80 // Mock match calculation
                    return (
                      <Card
                        key={index}
                        className="bg-[#111111]/80 border-[#ffcb74]/20 hover:border-[#ffcb74]/50 transition-all duration-300 hover:shadow-lg"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold mb-1 text-[#f6f6f6]">{job.title}</h3>
                              <p className="text-[#ffcb74] font-medium mb-2">{job.company?.name}</p>
                              <div className="flex items-center space-x-4 text-sm text-[#f6f6f6]/70 mb-3">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {job.location}
                                </div>
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  {job.salary_range}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {new Date(job.created_at).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {job.skills_required?.slice(0, 3).map((skill: string, skillIndex: number) => (
                                  <Badge
                                    key={skillIndex}
                                    className="bg-[#ffcb74]/20 text-[#ffcb74] hover:bg-[#ffcb74]/30 text-xs"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-[#ffcb74] mb-1">{matchScore}%</div>
                              <div className="text-xs text-[#f6f6f6]/50 mb-3">Match</div>
                              <Button
                                onClick={() => handleApplyToJob(job.id)}
                                className="bg-[#ffcb74] hover:bg-[#ffcb74]/80 text-[#111111] font-semibold"
                              >
                                Apply Now
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="interview" className="space-y-6">
                {/* Company Selection */}
                <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-[#f6f6f6]">
                      <MessageSquare className="mr-2 h-5 w-5 text-[#ffcb74]" />
                      Select Company for AI Video Interview
                    </CardTitle>
                    <CardDescription className="text-[#f6f6f6]/70">
                      Choose a company to practice your interview with our AI interviewer Sarah
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {jobs.slice(0, 6).map((job, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            selectedCompany?.id === job.id
                              ? "border-[#ffcb74] bg-[#ffcb74]/10"
                              : "border-[#ffcb74]/20 bg-[#2f2f2f] hover:border-[#ffcb74]/50"
                          }`}
                          onClick={() => setSelectedCompany(job)}
                        >
                          <h4 className="font-semibold text-[#f6f6f6] mb-1">{job.company?.name}</h4>
                          <p className="text-[#ffcb74] text-sm mb-2">{job.title}</p>
                          <p className="text-[#f6f6f6]/70 text-xs">{job.location}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Interview Start */}
                {selectedCompany && (
                  <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-[#f6f6f6]">
                        <MessageSquare className="mr-2 h-5 w-5 text-[#ffcb74]" />
                        AI Video Interview with Sarah
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center py-8">
                      <div className="w-20 h-20 bg-[#ffcb74]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="h-10 w-10 text-[#ffcb74]" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-[#f6f6f6]">Meet Your AI Interviewer: Sarah</h3>
                      <p className="text-[#f6f6f6]/70 mb-6 max-w-md mx-auto">
                        Sarah is an experienced HR professional who will conduct your interview using advanced AI
                        technology with real-time video avatar. She'll ask relevant questions and provide feedback.
                      </p>
                      <div className="bg-[#2f2f2f] rounded-lg p-4 mb-6 border border-[#ffcb74]/20">
                        <h4 className="font-semibold text-[#ffcb74] mb-2">Interviewing for:</h4>
                        <p className="text-[#f6f6f6]">{selectedCompany.company?.name}</p>
                        <p className="text-[#f6f6f6]/70">{selectedCompany.title}</p>
                      </div>
                      <Button
                        onClick={() => setShowTavusInterview(true)}
                        className="bg-[#ffcb74] hover:bg-[#ffcb74]/80 text-[#111111] font-semibold"
                      >
                        Start AI Video Interview
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Previous Interview Results */}
                <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#f6f6f6]">Previous AI Interview Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {interviewSessions.length > 0 ? (
                        interviewSessions.map((session, index) => (
                          <div
                            key={session.id || index}
                            className="flex items-center justify-between p-3 bg-[#2f2f2f] rounded-lg border border-[#ffcb74]/20"
                          >
                            <div>
                              <div className="font-medium text-[#f6f6f6]">
                                {new Date(session.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-[#f6f6f6]/70">
                                {session.feedback || "AI video interview completed"}
                              </div>
                              <div className="text-xs text-[#f6f6f6]/50">
                                {session.questions_asked} questions answered
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-[#ffcb74]">
                                {session.score ? `${session.score}/10` : "Completed"}
                              </div>
                              <div className="text-xs text-[#f6f6f6]/50">{session.status}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-[#f6f6f6]/50">
                          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No AI interview sessions yet</p>
                          <p className="text-sm">Complete your first AI video interview to see results here</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applications" className="space-y-6">
                <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-[#f6f6f6]">
                      <Target className="mr-2 h-5 w-5 text-[#ffcb74]" />
                      Application Status
                    </CardTitle>
                    <CardDescription className="text-[#f6f6f6]/70">
                      Track your job applications and their progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {applications.slice(0, 10).map((app, index) => {
                        const getStatusColor = (status: string) => {
                          switch (status.toLowerCase()) {
                            case "interview":
                            case "interview_scheduled":
                              return "bg-[#ffcb74]/20 text-[#ffcb74]"
                            case "under_review":
                            case "reviewing":
                              return "bg-yellow-500/20 text-yellow-400"
                            case "accepted":
                            case "hired":
                              return "bg-green-500/20 text-green-400"
                            case "rejected":
                              return "bg-red-500/20 text-red-400"
                            default:
                              return "bg-[#f6f6f6]/20 text-[#f6f6f6]/70"
                          }
                        }

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border border-[#ffcb74]/20 rounded-lg bg-[#2f2f2f]"
                          >
                            <div>
                              <h4 className="font-semibold text-[#f6f6f6]">{app.job_posting?.title}</h4>
                              <p className="text-sm text-[#ffcb74] mb-1">{app.job_posting?.company?.name}</p>
                              <p className="text-xs text-[#f6f6f6]/50">
                                Applied {new Date(app.applied_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className={`${getStatusColor(app.status)} text-xs`}>
                                {app.status.replace("_", " ").toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
              <CardHeader>
                <CardTitle className="text-lg text-[#f6f6f6]">Profile Completion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#f6f6f6]">Profile Strength</span>
                    <span className="text-[#ffcb74] font-semibold">85%</span>
                  </div>
                  <Progress value={85} className="h-2 bg-[#2f2f2f]" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-[#ffcb74] mr-2" />
                    <span className="text-[#f6f6f6]">Personal info completed</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-[#ffcb74] mr-2" />
                    <span className="text-[#f6f6f6]">Professional background added</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-[#ffcb74] mr-2" />
                    <span className="text-[#f6f6f6]">Skills & interests listed</span>
                  </div>
                  <div className="flex items-center text-sm text-[#f6f6f6]/50">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Upload resume</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Alerts */}
            <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
              <CardHeader>
                <CardTitle className="text-lg text-[#f6f6f6] flex items-center">
                  <Bell className="w-4 h-4 mr-2 text-[#ffcb74]" />
                  Job Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-[#ffcb74]/10 rounded-lg border border-[#ffcb74]/30">
                    <div className="font-medium text-[#ffcb74] mb-1">5 New Matches</div>
                    <div className="text-sm text-[#f6f6f6]/70">Based on your React & Node.js skills</div>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div className="font-medium text-green-400 mb-1">Interview Scheduled</div>
                    <div className="text-sm text-[#f6f6f6]/70">TechFlow AI - Tomorrow 2:00 PM</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
              <CardHeader>
                <CardTitle className="text-lg text-[#f6f6f6] flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-[#ffcb74]" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-[#2f2f2f] rounded-lg border border-[#ffcb74]/20">
                    <div className="text-2xl font-bold text-[#ffcb74]">15</div>
                    <div className="text-sm text-[#f6f6f6]/70">Applications</div>
                  </div>
                  <div className="text-center p-3 bg-[#2f2f2f] rounded-lg border border-[#ffcb74]/20">
                    <div className="text-2xl font-bold text-[#ffcb74]">4</div>
                    <div className="text-sm text-[#f6f6f6]/70">Interviews</div>
                  </div>
                  <div className="text-center p-3 bg-[#2f2f2f] rounded-lg border border-[#ffcb74]/20">
                    <div className="text-2xl font-bold text-[#ffcb74]">8.5</div>
                    <div className="text-sm text-[#f6f6f6]/70">Avg Score</div>
                  </div>
                  <div className="text-center p-3 bg-[#2f2f2f] rounded-lg border border-[#ffcb74]/20">
                    <div className="text-2xl font-bold text-[#ffcb74]">95%</div>
                    <div className="text-sm text-[#f6f6f6]/70">Top Match</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievement Badge */}
            <Card className="bg-gradient-to-br from-[#ffcb74]/20 to-[#ffcb74]/10 border-[#ffcb74]/30">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-[#ffcb74] mx-auto mb-2" />
                <h3 className="font-semibold text-[#f6f6f6] mb-1">Profile Expert</h3>
                <p className="text-sm text-[#f6f6f6]/70">Your profile is 85% complete!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Tavus Interview Modal */}
      <TavusInterviewModal
        isOpen={showTavusInterview}
        onClose={() => setShowTavusInterview(false)}
        jobPosting={selectedCompany}
        onInterviewComplete={handleInterviewComplete}
      />
    </div>
  )
}
