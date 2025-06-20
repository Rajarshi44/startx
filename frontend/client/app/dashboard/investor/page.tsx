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
import DealFlow from '@/components/sections/investor/DealFlow'
import Portfolio from '@/components/sections/investor/Portfolio'
import Analytics from '@/components/sections/investor/Analytics'
import Preferences from '@/components/sections/investor/Preferences'

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
                <DealFlow />
              </TabsContent>

              <TabsContent value="portfolio" className="space-y-6">
                <Portfolio />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Analytics />
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                <Preferences />
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
