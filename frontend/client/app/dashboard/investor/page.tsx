"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Calendar, BarChart3, Target, Zap, LogOut } from "lucide-react"
import DealFlow from "@/components/sections/investor/DealFlow"
import Portfolio from "@/components/sections/investor/Portfolio"
import Analytics from "@/components/sections/investor/Analytics"
import Preferences from "@/components/sections/investor/Preferences"
import Link from "next/link"

export default function InvestorDashboard() {
  const [activeTab, setActiveTab] = useState("dealflow")

  const renderContent = () => {
    switch (activeTab) {
      case "dealflow":
        return <DealFlow />
      case "portfolio":
        return <Portfolio />
      case "analytics":
        return <Analytics />
      case "preferences":
        return <Preferences />
      default:
        return <DealFlow />
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
                    8
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Pitch Reviews</span>
                  <span className="font-semibold" style={{ color: "#ffcb74" }}>
                    3
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Meetings Scheduled</span>
                  <span className="font-semibold" style={{ color: "#ffcb74" }}>
                    2
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Due Diligence</span>
                  <span className="font-semibold" style={{ color: "#ffcb74" }}>
                    1
                  </span>
                </div>
              </CardContent>
            </Card>

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
    </div>
  )
}
