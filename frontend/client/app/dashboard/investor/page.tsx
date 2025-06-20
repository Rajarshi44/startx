"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  DollarSign,
  Eye,
  Users,
  Calendar,
  BarChart3,
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
  Filter,
} from "lucide-react"

export default function InvestorDashboard() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Investor Dashboard</h1>
              <p className="text-gray-600">Discover and invest in promising startups</p>
            </div>
            <Badge className="bg-teal-100 text-teal-700">Investor Portal</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="dealflow" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dealflow">Deal Flow</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              <TabsContent value="dealflow" className="space-y-6">
                {/* Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Filter className="mr-2 h-5 w-5 text-teal-600" />
                      Deal Flow Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Industry</label>
                        <Input placeholder="e.g., SaaS, FinTech" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Stage</label>
                        <Input placeholder="e.g., Seed, Series A" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Funding Range</label>
                        <Input placeholder="e.g., $1M - $5M" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Location</label>
                        <Input placeholder="e.g., SF, Remote" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["AI/ML", "SaaS", "FinTech", "HealthTech", "B2B", "Consumer"].map((filter) => (
                        <Badge
                          key={filter}
                          variant={selectedFilters.includes(filter) ? "default" : "outline"}
                          className={`cursor-pointer ${
                            selectedFilters.includes(filter)
                              ? "bg-teal-600 text-white"
                              : "bg-white text-gray-600 hover:bg-teal-50"
                          }`}
                          onClick={() => toggleFilter(filter)}
                        >
                          {filter}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Startup Cards */}
                <div className="space-y-6">
                  {[
                    {
                      name: "FlowAI",
                      tagline: "AI-powered workflow automation for enterprises",
                      industry: "AI/ML",
                      stage: "Series A",
                      funding: "$3M",
                      valuation: "$15M",
                      traction: "500+ customers, $2M ARR",
                      team: "Ex-Google, Stanford PhDs",
                      score: 9.2,
                      trend: "up",
                    },
                    {
                      name: "HealthSync",
                      tagline: "Connecting patients with specialists through telemedicine",
                      industry: "HealthTech",
                      stage: "Seed",
                      funding: "$1.5M",
                      valuation: "$8M",
                      traction: "10K+ users, growing 20% MoM",
                      team: "Healthcare veterans, MIT grads",
                      score: 8.7,
                      trend: "up",
                    },
                    {
                      name: "CryptoVault",
                      tagline: "Institutional-grade cryptocurrency custody solutions",
                      industry: "FinTech",
                      stage: "Series A",
                      funding: "$5M",
                      valuation: "$25M",
                      traction: "$50M+ assets under custody",
                      team: "Ex-Goldman Sachs, Coinbase",
                      score: 8.9,
                      trend: "stable",
                    },
                  ].map((startup, index) => (
                    <Card key={index} className="border-teal-200 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-bold">{startup.name}</h3>
                              <Badge className="bg-teal-100 text-teal-700">{startup.industry}</Badge>
                              <Badge variant="outline" className="bg-white text-gray-600">
                                {startup.stage}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-4">{startup.tagline}</p>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <div className="flex items-center text-sm">
                                  <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                                  <span className="font-medium">Seeking:</span>
                                  <span className="ml-1">{startup.funding}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Target className="h-4 w-4 text-blue-600 mr-2" />
                                  <span className="font-medium">Valuation:</span>
                                  <span className="ml-1">{startup.valuation}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center text-sm">
                                  <BarChart3 className="h-4 w-4 text-purple-600 mr-2" />
                                  <span className="font-medium">Traction:</span>
                                  <span className="ml-1">{startup.traction}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Users className="h-4 w-4 text-orange-600 mr-2" />
                                  <span className="font-medium">Team:</span>
                                  <span className="ml-1">{startup.team}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-right ml-6">
                            <div className="flex items-center justify-end mb-2">
                              <div className="text-3xl font-bold text-teal-600 mr-2">{startup.score}</div>
                              {startup.trend === "up" ? (
                                <ArrowUp className="h-5 w-5 text-green-500" />
                              ) : startup.trend === "down" ? (
                                <ArrowDown className="h-5 w-5 text-red-500" />
                              ) : (
                                <div className="w-5 h-5" />
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mb-4">AI Score</div>
                            <div className="space-y-2">
                              <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700">
                                <Eye className="mr-2 h-4 w-4" />
                                View Pitch
                              </Button>
                              <Button size="sm" variant="outline" className="w-full bg-white text-teal-600">
                                Request Intro
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="portfolio" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="mr-2 h-5 w-5 text-green-600" />
                      Portfolio Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 mb-1">$2.5M</div>
                        <div className="text-sm text-gray-600">Total Invested</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
                        <div className="text-sm text-gray-600">Companies</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-1">3.2x</div>
                        <div className="text-sm text-gray-600">Avg Multiple</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 mb-1">2</div>
                        <div className="text-sm text-gray-600">Exits</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {[
                    {
                      name: "DataFlow Pro",
                      investment: "$250K",
                      currentValue: "$800K",
                      multiple: "3.2x",
                      status: "Growing",
                      lastUpdate: "Q4 2024",
                    },
                    {
                      name: "MedTech Solutions",
                      investment: "$150K",
                      currentValue: "$450K",
                      multiple: "3.0x",
                      status: "Stable",
                      lastUpdate: "Q3 2024",
                    },
                    {
                      name: "EcoLogistics",
                      investment: "$200K",
                      currentValue: "$180K",
                      multiple: "0.9x",
                      status: "Challenged",
                      lastUpdate: "Q4 2024",
                    },
                  ].map((company, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold mb-1">{company.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Invested: {company.investment}</span>
                              <span>•</span>
                              <span>Current: {company.currentValue}</span>
                              <span>•</span>
                              <span>Updated: {company.lastUpdate}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-lg font-bold mb-1 ${
                                Number.parseFloat(company.multiple) > 1 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {company.multiple}
                            </div>
                            <Badge
                              className={`text-xs ${
                                company.status === "Growing"
                                  ? "bg-green-100 text-green-700"
                                  : company.status === "Stable"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {company.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
                      Investment Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Industry Distribution</h4>
                        <div className="space-y-2">
                          {[
                            { industry: "SaaS", percentage: 40, color: "bg-blue-500" },
                            { industry: "FinTech", percentage: 25, color: "bg-green-500" },
                            { industry: "HealthTech", percentage: 20, color: "bg-purple-500" },
                            { industry: "AI/ML", percentage: 15, color: "bg-orange-500" },
                          ].map((item, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded ${item.color}`} />
                              <span className="text-sm flex-1">{item.industry}</span>
                              <span className="text-sm font-medium">{item.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Stage Distribution</h4>
                        <div className="space-y-2">
                          {[
                            { stage: "Seed", percentage: 50, color: "bg-teal-500" },
                            { stage: "Series A", percentage: 30, color: "bg-indigo-500" },
                            { stage: "Series B", percentage: 20, color: "bg-pink-500" },
                          ].map((item, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded ${item.color}`} />
                              <span className="text-sm flex-1">{item.stage}</span>
                              <span className="text-sm font-medium">{item.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="mr-2 h-5 w-5 text-orange-600" />
                      Investment Preferences
                    </CardTitle>
                    <CardDescription>Set your investment criteria to receive better deal flow matches</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Preferred Industries</label>
                        <Input placeholder="e.g., SaaS, FinTech, AI/ML" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Investment Range</label>
                        <Input placeholder="e.g., $50K - $500K" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Preferred Stages</label>
                        <Input placeholder="e.g., Seed, Series A" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Geographic Focus</label>
                        <Input placeholder="e.g., US, Europe, Global" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Minimum Traction Requirements</label>
                      <Input placeholder="e.g., $100K ARR, 1000+ users" />
                    </div>
                    <Button className="bg-orange-600 hover:bg-orange-700">Update Preferences</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New Deals</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pitch Reviews</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Meetings Scheduled</span>
                  <span className="font-semibold">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Due Diligence</span>
                  <span className="font-semibold">1</span>
                </div>
              </CardContent>
            </Card>

            {/* Trending Sectors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trending Sectors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { sector: "AI/ML", growth: "+15%", color: "text-green-600" },
                    { sector: "Climate Tech", growth: "+12%", color: "text-green-600" },
                    { sector: "Web3", growth: "-5%", color: "text-red-600" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.sector}</span>
                      <span className={`text-sm font-medium ${item.color}`}>{item.growth}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 text-blue-600 mt-1" />
                    <div>
                      <div className="text-sm font-medium">FlowAI Pitch</div>
                      <div className="text-xs text-gray-500">Tomorrow, 2:00 PM</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 text-purple-600 mt-1" />
                    <div>
                      <div className="text-sm font-medium">VC Meetup</div>
                      <div className="text-xs text-gray-500">Friday, 6:00 PM</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 text-green-600 mt-1" />
                    <div>
                      <div className="text-sm font-medium">Portfolio Review</div>
                      <div className="text-xs text-gray-500">Next Monday</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="text-sm font-medium text-yellow-800 mb-1">High Potential Deal</div>
                    <div className="text-xs text-yellow-700">FlowAI matches 95% of your criteria</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-1">Market Trend</div>
                    <div className="text-xs text-blue-700">AI/ML startups seeing 20% valuation increase</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
