"use client"

import { useFounderContext, JourneyStep, STEP_METADATA } from '@/utils/founder-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartContainer } from "@/components/ui/chart"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { TrendingUp, Target, Users, DollarSign, Briefcase, Clock, CheckCircle } from 'lucide-react'

// Progress Ring Component
export function ProgressRing({ progress, size = 120, strokeWidth = 8 }: { 
  progress: number
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={size}
        width={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-amber-400 transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{Math.round(progress)}%</div>
          <div className="text-xs text-gray-400">Complete</div>
        </div>
      </div>
    </div>
  )
}

// Journey Progress Chart
export function JourneyProgressChart() {
  const { state } = useFounderContext()

  const chartData = Object.entries(state.stepProgress).map(([step, progress]) => ({
    step: STEP_METADATA[step as JourneyStep].title,
    completed: progress.completed ? 1 : 0,
    icon: STEP_METADATA[step as JourneyStep].icon,
    color: STEP_METADATA[step as JourneyStep].color
  }))

  const colors = {
    blue: '#3b82f6',
    amber: '#f59e0b',
    green: '#10b981',
    purple: '#8b5cf6',
    indigo: '#6366f1',
    red: '#ef4444'
  }

  return (
    <Card className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white font-light text-lg flex items-center">
          <Target className="mr-2 h-5 w-5 text-amber-400" />
          Journey Progress
        </CardTitle>
        <CardDescription className="text-gray-400">
          Your startup journey completion status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {chartData.map((item, index) => (
            <div key={index} className="text-center">
              <div className={`w-12 h-12 mx-auto rounded-full border-2 flex items-center justify-center mb-2 ${
                item.completed 
                  ? 'border-green-400 bg-green-400/20 text-green-400' 
                  : 'border-gray-600 bg-gray-600/20 text-gray-400'
              }`}>
                <span className="text-lg">{item.icon}</span>
              </div>
              <div className="text-xs text-gray-300 font-light">{item.step}</div>
              {item.completed && (
                <CheckCircle className="w-4 h-4 text-green-400 mx-auto mt-1" />
              )}
            </div>
          ))}
        </div>
        
        <ChartContainer config={{}} className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="step" 
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  background: '#1f2937', 
                  border: '1px solid #374151', 
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Bar dataKey="completed" radius={4}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[entry.color as keyof typeof colors] || '#f59e0b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Analytics Overview
export function AnalyticsOverview() {
  const { state } = useFounderContext()
  const { analytics } = state

  const metricsData = [
    {
      title: 'Idea Validations',
      value: analytics.totalValidations,
      icon: TrendingUp,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10'
    },
    {
      title: 'Average Idea Score',
      value: analytics.averageIdeaScore.toFixed(1),
      icon: Target,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      title: 'Investor Views',
      value: analytics.totalInvestorViews,
      icon: DollarSign,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      title: 'Job Applications',
      value: analytics.totalJobApplications,
      icon: Briefcase,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metricsData.map((metric, index) => (
        <Card key={index} className="border border-amber-500/20 rounded-xl bg-black/40 hover:bg-black/60 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{metric.value}</div>
                <div className="text-xs text-gray-400">{metric.title}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Score Distribution Chart
export function ScoreDistributionChart() {
  const { state } = useFounderContext()
  
  const scoreRanges = [
    { name: '0-2', range: [0, 2], count: 0, color: '#ef4444' },
    { name: '3-4', range: [3, 4], count: 0, color: '#f97316' },
    { name: '5-6', range: [5, 6], count: 0, color: '#eab308' },
    { name: '7-8', range: [7, 8], count: 0, color: '#22c55e' },
    { name: '9-10', range: [9, 10], count: 0, color: '#10b981' }
  ]

  // Count validations by score range
  state.ideaValidations.forEach(validation => {
    if (validation.score) {
      const range = scoreRanges.find(r => 
        validation.score >= r.range[0] && validation.score <= r.range[1]
      )
      if (range) range.count++
    }
  })

  const chartData = scoreRanges.filter(range => range.count > 0)

  if (chartData.length === 0) {
    return (
      <Card className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-light text-lg">Score Distribution</CardTitle>
          <CardDescription className="text-gray-400">
            Idea validation score ranges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <Target className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No validation scores available yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white font-light text-lg">Score Distribution</CardTitle>
        <CardDescription className="text-gray-400">
          Your idea validation scores by range
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: '#1f2937', 
                  border: '1px solid #374151', 
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center text-xs">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-300">{item.name}: {item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Timeline Chart
export function TimelineChart() {
  const { state } = useFounderContext()
  
  const timelineData = Object.entries(state.stepProgress)
    .filter(([_, progress]) => progress.completed && progress.completedAt)
    .map(([step, progress]) => ({
      step: STEP_METADATA[step as JourneyStep].title,
      date: new Date(progress.completedAt!).toLocaleDateString(),
      timestamp: new Date(progress.completedAt!).getTime(),
      score: progress.score || 0
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

  if (timelineData.length === 0) {
    return (
      <Card className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-light text-lg">Progress Timeline</CardTitle>
          <CardDescription className="text-gray-400">
            Your journey completion timeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Complete some steps to see your timeline</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white font-light text-lg">Progress Timeline</CardTitle>
        <CardDescription className="text-gray-400">
          Your journey completion timeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  background: '#1f2937', 
                  border: '1px solid #374151', 
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#f59e0b" 
                fill="url(#scoreGradient)" 
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Step Comparison Radar Chart
export function StepComparisonRadar() {
  const { state } = useFounderContext()

  const radarData = [
    {
      category: 'Profile',
      value: state.stepProgress[JourneyStep.PROFILE_SETUP].completed ? 10 : 0,
      fullMark: 10
    },
    {
      category: 'Validation',
      value: state.analytics.averageIdeaScore || 0,
      fullMark: 10
    },
    {
      category: 'Policy',
      value: state.policyResearch.length > 0 ? 8 : 0,
      fullMark: 10
    },
    {
      category: 'Team',
      value: state.cofounderMatches.length > 0 ? 7 : 0,
      fullMark: 10
    },
    {
      category: 'Investors',
      value: state.investorMatches.length > 0 ? 6 : 0,
      fullMark: 10
    },
    {
      category: 'Jobs',
      value: state.jobPostings.length > 0 ? 5 : 0,
      fullMark: 10
    }
  ]

  return (
    <Card className="border border-amber-500/20 rounded-2xl bg-black/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white font-light text-lg">Journey Radar</CardTitle>
        <CardDescription className="text-gray-400">
          Multi-dimensional progress overview
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 10]} 
                tick={{ fill: '#9ca3af', fontSize: 10 }} 
              />
              <Radar
                name="Progress"
                dataKey="value"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 