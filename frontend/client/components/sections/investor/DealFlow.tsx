import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Filter, DollarSign, Target, BarChart3, Users, Eye, ArrowUp, ArrowDown } from "lucide-react"

export default function DealFlow() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }
  const startups = [
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
  ]
  return (
    <>
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
        {startups.map((startup, index) => (
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
    </>
  )
} 