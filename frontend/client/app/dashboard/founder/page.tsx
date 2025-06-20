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

export default function FounderDashboard() {
  const [ideaText, setIdeaText] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationComplete, setValidationComplete] = useState(false)

  const handleValidateIdea = async () => {
    setIsValidating(true)
    // Simulate API call
    setTimeout(() => {
      setIsValidating(false)
      setValidationComplete(true)
    }, 3000)
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5 text-purple-600" />
                      Idea Validation
                    </CardTitle>
                    <CardDescription>
                      Describe your startup idea and get AI-powered validation and insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Startup Idea</label>
                      <Textarea
                        placeholder="Describe your startup idea, target market, and value proposition..."
                        value={ideaText}
                        onChange={(e) => setIdeaText(e.target.value)}
                        rows={6}
                        className="resize-none"
                      />
                    </div>
                    <Button
                      onClick={handleValidateIdea}
                      disabled={!ideaText.trim() || isValidating}
                      className="bg-purple-600 hover:bg-purple-700"
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
                  </CardContent>
                </Card>

                {validationComplete && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-green-800">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Validation Complete
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-white rounded-lg">
                          <div className="text-2xl font-bold text-green-600 mb-1">8.2/10</div>
                          <div className="text-sm text-gray-600">Market Viability</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 mb-1">7.8/10</div>
                          <div className="text-sm text-gray-600">Competition Score</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg">
                          <div className="text-2xl font-bold text-purple-600 mb-1">9.1/10</div>
                          <div className="text-sm text-gray-600">Innovation Index</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-green-800 mb-2">Strengths</h4>
                          <ul className="text-sm text-green-700 space-y-1">
                            <li>• Strong market demand identified</li>
                            <li>• Clear value proposition</li>
                            <li>• Scalable business model</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-orange-800 mb-2">Areas to Consider</h4>
                          <ul className="text-sm text-orange-700 space-y-1">
                            <li>• Competitive landscape analysis needed</li>
                            <li>• Consider pricing strategy</li>
                            <li>• Validate with target customers</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                          <Input placeholder="e.g., Technical, Marketing, Sales" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Experience Level</label>
                          <Input placeholder="e.g., 5+ years, Senior level" />
                        </div>
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700">Find Co-founders</Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">Sarah Chen</h4>
                            <p className="text-sm text-gray-600 mb-2">Full-stack Developer, 8 years exp</p>
                            <div className="flex flex-wrap gap-1 mb-3">
                              <Badge variant="secondary" className="text-xs">
                                React
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                Node.js
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                AI/ML
                              </Badge>
                            </div>
                            <div className="text-sm text-green-600 font-medium mb-2">92% Compatibility Match</div>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Connect
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
