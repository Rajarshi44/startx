"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lightbulb, Users, TrendingUp, FileText, CheckCircle, Clock, Sparkles, Target, DollarSign } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function FounderDashboard() {
  const [ideaText, setIdeaText] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationComplete, setValidationComplete] = useState(false)
  const [isMatching, setIsMatching] = useState(false)
  const [cofounderResults, setCofounderResults] = useState<any[]>([])
  const [skillsNeeded, setSkillsNeeded] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [progress, setProgress] = useState(25)

  useEffect(() => {
    let completedTasks = 0
    const totalTasks = 4

    if (validationComplete) completedTasks++
    if (cofounderResults.length > 0) completedTasks++
    // Add more conditions as features are completed

    const newProgress = (completedTasks / totalTasks) * 100
    setProgress(newProgress)
  }, [validationComplete, cofounderResults.length])

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
    setIsValidating(true)
    setTimeout(() => {
      setIsValidating(false)
      setValidationComplete(true)
    }, 3000)
  }

  const handleFindCofounders = () => {
    setIsMatching(true)
    setCofounderResults([])
    setTimeout(() => {
      const shuffled = mockProfiles.sort(() => 0.5 - Math.random())
      setCofounderResults(shuffled.slice(0, 3))
      setIsMatching(false)
    }, 1800)
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
              <TabsList className="grid w-full grid-cols-4 p-1 rounded-xl bg-gray-900/50 border border-amber-500/20 backdrop-blur-sm">
                {["idea", "team", "investors", "pitch"].map((tab, index) => (
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

                {validationComplete && (
                  <Card className="border border-amber-500/30 rounded-2xl bg-black/80 backdrop-blur-sm animate-slide-in-up shadow-2xl shadow-amber-500/10">
                    <CardHeader>
                      <CardTitle className="text-white font-light text-xl">Validation Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        {[
                          { score: "8.5/10", label: "Market Potential" },
                          { score: "7.2/10", label: "Competition Level" },
                          { score: "9.1/10", label: "Innovation Score" },
                        ].map((item, index) => (
                          <div
                            key={item.label}
                            className="text-center p-6 rounded-xl bg-black/30 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 animate-fade-in"
                            style={{ animationDelay: `${index * 200}ms` }}
                          >
                            <div className="text-3xl font-light mb-2 text-amber-400 animate-number-count">
                              {item.score}
                            </div>
                            <div className="text-sm text-gray-300 font-light tracking-wide">{item.label}</div>
                          </div>
                        ))}
                      </div>
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
                                .map((n) => n[0])
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
                            <Button
                              size="sm"
                              className="text-sm px-6 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-500 hover:to-amber-600 transition-all duration-300 font-light hover:scale-105"
                            >
                              Connect
                            </Button>
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
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      {["Industry", "Stage", "Funding Goal"].map((label, index) => (
                        <div key={label} className="animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                          <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">{label}</label>
                          <Input
                            placeholder={
                              label === "Industry"
                                ? "e.g., SaaS, FinTech"
                                : label === "Stage"
                                  ? "e.g., Pre-seed, Seed"
                                  : "e.g., $500K"
                            }
                            className="border border-amber-500/20 rounded-xl bg-black/50 text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 font-light"
                          />
                        </div>
                      ))}
                    </div>
                    <Button className="font-light px-8 py-3 rounded-xl transition-all duration-300 bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-500 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-105">
                      Find Investors
                    </Button>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <Card
                      key={i}
                      className="border border-amber-500/30 rounded-2xl bg-black/80 backdrop-blur-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500 animate-slide-in"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-500/25">
                              <DollarSign className="h-7 w-7 text-black" />
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-light text-lg text-white">TechVentures Capital</h4>
                              <p className="text-sm text-gray-400 font-light">Early-stage VC focusing on SaaS</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-400 font-light">
                                <span>$100K - $2M</span>
                                <span className="text-amber-500">•</span>
                                <span>Pre-seed to Series A</span>
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
                {[
                  { icon: Target, text: "Market Research" },
                  { icon: Users, text: "Browse Co-founders" },
                  { icon: FileText, text: "Business Plan Template" },
                ].map((action, index) => (
                  <Button
                    key={action.text}
                    variant="outline"
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
    </div>
  )
}
