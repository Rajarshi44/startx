"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lightbulb, Users, TrendingUp, FileText, CheckCircle, Clock, Sparkles, Target, DollarSign } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import IdeaValidation from '@/components/sections/founder/IdeaValidation'

export default function FounderDashboard() {
  const [ideaText, setIdeaText] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationComplete, setValidationComplete] = useState(false)
  // Co-founder matching state
  const [isMatching, setIsMatching] = useState(false)
  const [cofounderResults, setCofounderResults] = useState<any[]>([])
  const [skillsNeeded, setSkillsNeeded] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")

  // Mock co-founder profiles
  const mockProfiles = [
    {
      name: "Sarah Chen",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      title: "Full-stack Developer, 8 years exp",
      skills: ["React", "Node.js", "AI/ML"],
      compatibility: 92,
    },
    {
      name: "Alex Ivanov",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      title: "Product Designer, 6 years exp",
      skills: ["Figma", "UX", "Branding"],
      compatibility: 88,
    },
    {
      name: "Priya Patel",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      title: "Growth Marketer, 10 years exp",
      skills: ["SEO", "Content", "Paid Ads"],
      compatibility: 85,
    },
    {
      name: "David Kim",
      avatar: "https://randomuser.me/api/portraits/men/76.jpg",
      title: "AI Engineer, 5 years exp",
      skills: ["Python", "TensorFlow", "LLMs"],
      compatibility: 90,
    },
  ]

  const handleValidateIdea = async () => {
    setIsValidating(true)
    // Simulate API call
    setTimeout(() => {
      setIsValidating(false)
      setValidationComplete(true)
    }, 3000)
  }

  const handleFindCofounders = () => {
    setIsMatching(true)
    setCofounderResults([])
    setTimeout(() => {
      // Shuffle and pick 2-3 random profiles
      const shuffled = mockProfiles.sort(() => 0.5 - Math.random())
      setCofounderResults(shuffled.slice(0, 3))
      setIsMatching(false)
    }, 1800)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Founder Dashboard</h1>
              <p className="text-gray-600">Build your startup from idea to investment</p>
            </div>
            <Badge className="bg-purple-100 text-purple-700">Founder Journey</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="idea" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="idea">Idea</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="investors">Investors</TabsTrigger>
                <TabsTrigger value="pitch">Pitch</TabsTrigger>
              </TabsList>

              <TabsContent value="idea" className="space-y-6">
                <IdeaValidation />
              </TabsContent>

              <TabsContent value="team" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5 text-blue-600" />
                      Co-founder Matching
                    </CardTitle>
                    <CardDescription>
                      Find compatible co-founders based on skills, experience, and personality
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Skills Needed</label>
                          <Input
                            placeholder="e.g., Technical, Marketing, Sales"
                            value={skillsNeeded}
                            onChange={e => setSkillsNeeded(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Experience Level</label>
                          <Input
                            placeholder="e.g., 5+ years, Senior level"
                            value={experienceLevel}
                            onChange={e => setExperienceLevel(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                        onClick={handleFindCofounders}
                        disabled={isMatching || !skillsNeeded.trim() || !experienceLevel.trim()}
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

                {/* Animated results */}
                <AnimatePresence>
                  {isMatching && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="flex justify-center py-8"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                        <div className="text-blue-600 font-medium">Finding your best matches...</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {cofounderResults.map((profile, i) => (
                      <motion.div
                        key={profile.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card className="border-blue-200 hover:shadow-xl transition-shadow duration-200 group">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <Avatar className="w-12 h-12 ring-2 ring-blue-200 group-hover:ring-blue-400 transition-all duration-200">
                                <img src={profile.avatar} alt={profile.name} className="rounded-full" />
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-semibold group-hover:text-blue-700 transition-colors duration-200">{profile.name}</h4>
                                <p className="text-sm text-gray-600 mb-2">{profile.title}</p>
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {profile.skills.map((skill: string) => (
                                    <Badge key={skill} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="text-sm text-green-600 font-medium mb-2">
                                  {profile.compatibility}% Compatibility Match
                                </div>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 transition-all duration-200">
                                  Connect
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </TabsContent>

              <TabsContent value="investors" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-teal-600" />
                      Investor Matching
                    </CardTitle>
                    <CardDescription>Connect with investors who match your industry and stage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Industry</label>
                        <Input placeholder="e.g., SaaS, FinTech" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Stage</label>
                        <Input placeholder="e.g., Pre-seed, Seed" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Funding Goal</label>
                        <Input placeholder="e.g., $500K" />
                      </div>
                    </div>
                    <Button className="bg-teal-600 hover:bg-teal-700">Find Investors</Button>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-teal-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                              <DollarSign className="h-6 w-6 text-teal-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">TechVentures Capital</h4>
                              <p className="text-sm text-gray-600 mb-2">Early-stage VC focusing on SaaS</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>$100K - $2M</span>
                                <span>•</span>
                                <span>Pre-seed to Series A</span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                            Connect
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pitch" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-orange-600" />
                      Pitch Deck Builder
                    </CardTitle>
                    <CardDescription>Create a compelling pitch deck with AI assistance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Company Name</label>
                          <Input placeholder="Your startup name" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Industry</label>
                          <Input placeholder="e.g., FinTech, HealthTech" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">One-liner</label>
                        <Input placeholder="Describe your startup in one sentence" />
                      </div>
                      <Button className="bg-orange-600 hover:bg-orange-700">Generate Pitch Deck</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Startup Journey</span>
                    <span>25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Idea validated</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Find co-founder</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Connect with investors</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Create pitch deck</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-white text-gray-700">
                  <Target className="mr-2 h-4 w-4" />
                  Market Research
                </Button>
                <Button variant="outline" className="w-full justify-start bg-white text-gray-700">
                  <Users className="mr-2 h-4 w-4" />
                  Browse Co-founders
                </Button>
                <Button variant="outline" className="w-full justify-start bg-white text-gray-700">
                  <FileText className="mr-2 h-4 w-4" />
                  Business Plan Template
                </Button>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <h4 className="font-medium mb-2">Recommended Reading</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• The Lean Startup</li>
                    <li>• Zero to One</li>
                    <li>• The Mom Test</li>
                  </ul>
                </div>
                <div className="text-sm">
                  <h4 className="font-medium mb-2">Upcoming Events</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Startup Pitch Night</li>
                    <li>• Founder Meetup</li>
                    <li>• Investor Demo Day</li>
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
