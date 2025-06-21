"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Lightbulb, CheckCircle, Clock, Target, Users, FileText } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { FounderProfile, Company, Validation, CofounderProfile } from "@/types/founder"

interface SidebarProps {
  founderProfile: FounderProfile | null
  companies: Company[]
  validations: Validation[]
  validationComplete: boolean
  cofounderResults: CofounderProfile[]
  ideaScore: number | null
  setShowCompanyModal: (show: boolean) => void
  setPerplexityResult: (result: string | null) => void
  setIdeaScore: (score: number | null) => void
  setShowScore: (show: boolean) => void
  setValidationComplete: (complete: boolean) => void
  setIdeaText: (text: string) => void
}

export function Sidebar({
  founderProfile,
  companies,
  validations,
  validationComplete,
  cofounderResults,
  ideaScore,
  setShowCompanyModal,
  setPerplexityResult,
  setIdeaScore,
  setShowScore,
  setValidationComplete,
  setIdeaText,
}: SidebarProps) {
  const progress = (() => {
    let completedTasks = 0
    const totalTasks = 4

    if (validationComplete) completedTasks++
    if (cofounderResults.length > 0) completedTasks++
    // Add more conditions as features are completed

    return (completedTasks / totalTasks) * 100
  })()

  const handleBrowseCofounders = async () => {
    try {
      const response = await fetch("/api/jobseeker?limit=10")
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
        toast({ title: "Success", description: `Found ${cofounders.length} potential co-founders!` })
      }
    } catch (error) {
      console.error("Error browsing co-founders:", error)
      toast({ title: "Error", description: "Failed to browse co-founders", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile Card */}
      {founderProfile && (
        <Card className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500 animate-slide-in-right">
          <CardHeader>
            <CardTitle className="text-xl font-light text-white flex items-center">
              <Avatar className="w-8 h-8 mr-3 ring-2 ring-amber-400/50">
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-500 text-black font-light text-sm">
                  {founderProfile.user?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") || "F"}
                </AvatarFallback>
              </Avatar>
              Founder Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-1">Name</h4>
                <p className="text-white font-light">{founderProfile.user?.name || "Not set"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-1">Email</h4>
                <p className="text-white font-light text-sm">{founderProfile.user?.email || "Not set"}</p>
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
        <Card
          className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500 animate-slide-in-right"
          style={{ animationDelay: "100ms" }}
        >
          <CardHeader>
            <CardTitle className="text-xl font-light text-white">Your Companies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {companies.map((company: Company) => (
              <div
                key={company.id}
                className="p-4 border border-amber-500/20 rounded-xl bg-black/30 hover:bg-black/50 transition-all duration-300"
              >
                <div className="space-y-2">
                  <h4 className="text-white font-medium">{company.name}</h4>
                  {company.description && <p className="text-gray-400 text-sm font-light">{company.description}</p>}
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
        <Card
          className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500 animate-slide-in-right"
          style={{ animationDelay: "200ms" }}
        >
          <CardHeader>
            <CardTitle className="text-xl font-light text-white flex items-center">
              <Lightbulb className="mr-3 h-5 w-5 text-amber-400" />
              Previous Validations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {validations.map((validation: Validation) => (
              <div
                key={validation.id}
                className="p-4 border border-amber-500/20 rounded-xl bg-black/30 hover:bg-black/50 transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-light text-sm leading-relaxed line-clamp-3">
                        {validation.idea_text}
                      </p>
                    </div>
                    {validation.score && (
                      <div className="ml-3 flex-shrink-0">
                        <div
                          className={`text-center px-3 py-1 rounded-full border ${
                            validation.score >= 7
                              ? "border-green-500/30 bg-green-500/10 text-green-400"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                          }`}
                        >
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

      {/* Progress Card */}
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
                className={`flex items-center text-sm font-light animate-slide-in transition-all duration-300 ${
                  item.completed ? "text-white" : "text-gray-400"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <item.icon
                  className={`h-4 w-4 mr-3 transition-colors duration-300 ${
                    item.completed ? "text-amber-400" : "text-gray-500"
                  }`}
                />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
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
                ? "border-green-500/60 bg-green-500/10 text-green-300 hover:text-white hover:bg-green-500/20"
                : "border-amber-500/20 bg-black/30 text-gray-300 hover:text-white hover:bg-amber-500/10"
            }`}
            style={{ animationDelay: `0ms` }}
            onClick={() => setShowCompanyModal(true)}
          >
            {ideaScore && ideaScore >= 7 ? "🚀 Create Company (Recommended)" : "+ Create Company"}
          </Button>
          {[
            { icon: Target, text: "Market Research", onClick: () => {} },
            {
              icon: Users,
              text: "Browse Co-founders",
              onClick: handleBrowseCofounders,
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

      {/* Resources Card */}
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
  )
}
