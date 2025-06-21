"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FileText, DollarSign } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ChartContainer } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import {
  Tabs as ShadTabs,
  TabsList as ShadTabsList,
  TabsTrigger as ShadTabsTrigger,
  TabsContent as ShadTabsContent,
} from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import type { CofounderProfile, Investor } from "@/types/founder"

interface ResultsSectionProps {
  isValidating: boolean
  perplexityError: string | null
  validationComplete: boolean
  perplexityResult: string | null
  showScore: boolean
  ideaScore: number | null
  isMatching: boolean
  cofounderResults: CofounderProfile[]
  investorsLoading: boolean
  investors: Investor[]
  isPolicyResearching: boolean
  policyError: string | null
  policyResearchComplete: boolean
  policyResult: string | null
  isPitchGenerating: boolean
  pitchError: string | null
  pitchComplete: boolean
  pitchResult: string | null
}

export function ResultsSection({
  isValidating,
  perplexityError,
  validationComplete,
  perplexityResult,
  showScore,
  ideaScore,
  isMatching,
  cofounderResults,
  investorsLoading,
  investors,
  isPolicyResearching,
  policyError,
  policyResearchComplete,
  policyResult,
  isPitchGenerating,
  pitchError,
  pitchComplete,
  pitchResult,
}: ResultsSectionProps) {
  const handleDownloadPitch = () => {
    if (!pitchResult) return

    // Parse markdown into slides for better formatting
    const slideRegex = /## Slide (\d+): ([^\n]+)\n([\s\S]*?)(?=\n## Slide |\n## |$)/g
    const slides: Array<{ number: number; title: string; content: string }> = []
    let match
    while ((match = slideRegex.exec(pitchResult))) {
      slides.push({
        number: Number.parseInt(match[1]),
        title: match[2].trim(),
        content: match[3].trim(),
      })
    }

    // Create a professional HTML pitch deck
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Startup Pitch Deck</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .slide {
            background: white;
            margin: 30px 0;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            page-break-after: always;
            min-height: 80vh;
            display: flex;
            flex-direction: column;
          }
          
          .slide:last-child {
            page-break-after: avoid;
          }
          
          .slide-header {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #f59e0b;
          }
          
          .slide-number {
            background: #f59e0b;
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
            margin-right: 20px;
          }
          
          .slide-title {
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
          }
          
          .slide-content {
            flex: 1;
            font-size: 16px;
            line-height: 1.8;
          }
          
          .cover-slide {
            text-align: center;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            justify-content: center;
          }
          
          .cover-slide .slide-title {
            font-size: 48px;
            color: white;
            margin-bottom: 20px;
          }
          
          @media print {
            body { background: white; }
            .slide { 
              box-shadow: none; 
              border: 1px solid #e5e7eb;
              margin: 0;
              min-height: 100vh;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${slides
            .map(
              (slide, index) => `
            <div class="slide ${slide.number === 1 ? "cover-slide" : ""}">
              ${
                slide.number === 1
                  ? `
                <h1 class="slide-title">${slide.title}</h1>
                <div class="subtitle">AI-Generated Startup Pitch Deck</div>
                <div class="date">${new Date().toLocaleDateString()}</div>
              `
                  : `
                <div class="slide-header">
                  <div class="slide-number">${slide.number}</div>
                  <h1 class="slide-title">${slide.title}</h1>
                </div>
              `
              }
              <div class="slide-content">
                ${slide.content
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                  .replace(/\*(.*?)\*/g, "<em>$1</em>")
                  .replace(/^### (.*$)/gm, "<h3>$1</h3>")
                  .replace(/^## (.*$)/gm, "<h2>$1</h2>")
                  .replace(/^# (.*$)/gm, "<h1>$1</h1>")
                  .replace(/^- (.*$)/gm, "<li>$1</li>")
                  .replace(/(<li>.*<\/li>)/g, "<ul>$1</ul>")
                  .replace(/\n\n/g, "</p><p>")
                  .replace(/^(?!<[hlu])/gm, "<p>")
                  .replace(/(?<!>)$/gm, "</p>")
                  .replace(/<p><\/p>/g, "")
                  .replace(/<p>(<[hlu])/g, "$1")
                  .replace(/(<\/[hlu][^>]*>)<\/p>/g, "$1")}
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "startup-pitch-deck.html"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "Professional pitch deck downloaded! Open the HTML file in your browser and print to PDF.",
    })
  }

  return (
    <div className="space-y-8">
      {/* Validation Loading */}
      {isValidating && (
        <div className="flex justify-center py-8 animate-fade-in">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
            <div className="font-light text-amber-400 tracking-wide animate-pulse">Researching your idea...</div>
          </div>
        </div>
      )}

      {/* Validation Error */}
      {perplexityError && (
        <Card className="border border-red-500/30 rounded-2xl bg-black/80 backdrop-blur-sm animate-slide-in-up shadow-2xl shadow-red-500/10">
          <CardHeader>
            <CardTitle className="text-red-400 font-light text-xl">Validation Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-300 font-light">{perplexityError}</div>
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      {validationComplete && perplexityResult && (
        <Card className="border border-amber-500/30 rounded-2xl bg-black/80 backdrop-blur-sm animate-slide-in-up shadow-2xl shadow-amber-500/10">
          <CardHeader>
            <CardTitle className="text-white font-light text-xl">Validation Results</CardTitle>
            {showScore && ideaScore && (
              <div className={`text-center py-6 ${ideaScore >= 7 ? "text-green-400" : "text-amber-400"}`}>
                <div className="text-6xl font-bold mb-2">{ideaScore}/10</div>
                <div className="text-xl font-semibold mb-2">Idea Score</div>
                {ideaScore >= 7 && (
                  <div className="text-lg text-green-300 mt-4 p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                    🎉 Excellent! This idea shows strong potential. Consider creating a company profile to track your
                    progress.
                  </div>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none text-white">
            {(() => {
              // Parse markdown into sections
              const sectionOrder = [
                "Market Demand",
                "SWOT Analysis",
                "Competitor Analysis",
                "Similar Companies",
                "Suggestions for Improvement",
                "Key Analytics and Scores",
              ]
              const sectionRegex = /## ([^\n]+)\n([\s\S]*?)(?=\n## |$)/g
              const sections: Record<string, string> = {}
              let match
              while ((match = sectionRegex.exec(perplexityResult))) {
                sections[match[1].trim()] = match[2].trim()
              }

              // Chart data for Key Analytics and Scores
              const chartData = [
                { name: "Online Books", value: 26.04, label: "Books 2025 ($B)" },
                { name: "Books 2034", value: 48.27, label: "Books 2034 ($B)" },
                { name: "E-Book Subscriptions", value: 8.7, label: "E-Book Subs 2033 ($B)" },
                { name: "CAGR", value: 7.1, label: "Books CAGR (%)" },
                { name: "E-Book CAGR", value: 9.5, label: "E-Book CAGR (%)" },
              ]
              const barColors = ["#fbbf24", "#f59e42", "#fcd34d", "#a3e635", "#38bdf8"]

              return (
                <ShadTabs defaultValue={sectionOrder[0]} className="w-full">
                  <ShadTabsList className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-6 bg-black/30 border border-amber-500/20 rounded-xl">
                    {sectionOrder.map((section: string) => (
                      <ShadTabsTrigger
                        key={section}
                        value={section}
                        className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-amber-500 data-[state=active]:text-black rounded-lg transition-all duration-300 hover:text-white font-light tracking-wide capitalize"
                      >
                        {section}
                      </ShadTabsTrigger>
                    ))}
                  </ShadTabsList>
                  {sectionOrder.map((section: string) => (
                    <ShadTabsContent key={section} value={section} className="pt-2">
                      {section === "Key Analytics and Scores" && (
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold mb-4 text-amber-400">Key Analytics and Scores</h3>
                          <ChartContainer
                            config={{
                              Books: { color: barColors[0] },
                              Books2034: { color: barColors[1] },
                              EBook: { color: barColors[2] },
                              CAGR: { color: barColors[3] },
                              EBookCAGR: { color: barColors[4] },
                            }}
                          >
                            <ResponsiveContainer width="100%" height={220}>
                              <BarChart data={chartData} margin={{ left: 16, right: 16, top: 16, bottom: 8 }}>
                                <XAxis
                                  dataKey="label"
                                  tick={{ fill: "#fff", fontSize: 13 }}
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <YAxis tick={{ fill: "#fff", fontSize: 13 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                  contentStyle={{ background: "#222", border: "none", color: "#fff" }}
                                  cursor={{ fill: "#fbbf2433" }}
                                />
                                <Bar dataKey="value">
                                  {chartData.map((entry, i) => (
                                    <Cell key={entry.name} fill={barColors[i]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      )}
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{sections[section] || "No data."}</ReactMarkdown>
                    </ShadTabsContent>
                  ))}
                </ShadTabs>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* Co-founder Matching Loading */}
      {isMatching && (
        <div className="flex justify-center py-12 animate-fade-in">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
            <div className="font-light text-amber-400 tracking-wide animate-pulse">Finding your best matches...</div>
          </div>
        </div>
      )}

      {/* Co-founder Results */}
      {cofounderResults.length > 0 && (
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
                    <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-500 text-black font-light">
                      {profile.name
                        .split(" ")
                        .map((n: string) => n[0])
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
                    {profile.location && <div className="text-xs text-gray-500 font-light">📍 {profile.location}</div>}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-500 hover:to-amber-600 transition-all duration-300 font-light hover:scale-105"
                      >
                        Connect
                      </Button>
                      {profile.email && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs px-3 py-2 rounded-lg border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-light"
                          onClick={() => window.open(`mailto:${profile.email}`, "_blank")}
                        >
                          Email
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Investors Loading */}
      {investorsLoading && (
        <div className="flex justify-center py-12 animate-fade-in">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
            <div className="font-light text-amber-400 tracking-wide animate-pulse">Finding investors...</div>
          </div>
        </div>
      )}

      {/* Investor Results */}
      {investors.length > 0 && (
        <div className="space-y-6">
          {investors.map((investor, i) => (
            <Card
              key={investor.id}
              className="border border-amber-500/30 rounded-2xl bg-black/80 backdrop-blur-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500 animate-slide-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-500/25">
                      <DollarSign className="h-7 w-7 text-black" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-light text-lg text-white">{investor.name}</h4>
                      <p className="text-sm text-gray-400 font-light">{investor.description}</p>
                      <div className="flex items-center flex-wrap gap-4 text-sm text-gray-400 font-light">
                        <span>
                          ${investor.minInvestment / 1000}K - ${investor.maxInvestment / 1000}K
                        </span>
                        <span className="text-amber-500">•</span>
                        <span>{investor.preferredStages?.join(", ") || "All stages"}</span>
                        {investor.portfolio > 0 && (
                          <>
                            <span className="text-amber-500">•</span>
                            <span>{investor.portfolio} portfolio companies</span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {investor.preferredIndustries?.slice(0, 3).map((industry: string) => (
                          <Badge
                            key={industry}
                            className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-light text-xs"
                          >
                            {industry}
                          </Badge>
                        ))}
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
      )}

      {/* Policy Research Loading */}
      {isPolicyResearching && (
        <div className="flex justify-center py-8 animate-fade-in">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
            <div className="font-light text-amber-400 tracking-wide animate-pulse">
              Researching government policies and programs...
            </div>
          </div>
        </div>
      )}

      {/* Policy Research Error */}
      {policyError && (
        <Card className="border border-red-500/30 rounded-2xl bg-black/80 backdrop-blur-sm animate-slide-in-up shadow-2xl shadow-red-500/10">
          <CardHeader>
            <CardTitle className="text-red-400 font-light text-xl">Research Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-300 font-light">{policyError}</div>
          </CardContent>
        </Card>
      )}

      {/* Policy Research Results */}
      {policyResearchComplete && policyResult && (
        <Card className="border border-amber-500/30 rounded-2xl bg-black/80 backdrop-blur-sm animate-slide-in-up shadow-2xl shadow-amber-500/10">
          <CardHeader>
            <CardTitle className="text-white font-light text-xl flex items-center">
              <FileText className="mr-3 h-6 w-6 text-amber-400" />
              Policy Research Results
            </CardTitle>
          </CardHeader>
          <CardContent className="max-w-none">
            <div className="prose prose-invert max-w-none text-white [&>*]:text-white [&>h1]:text-amber-300 [&>h2]:text-amber-300 [&>h3]:text-amber-200 [&>h4]:text-amber-200 [&>strong]:text-amber-100 [&>ul]:text-white [&>ol]:text-white [&>li]:text-white [&>p]:text-white [&>table]:text-white [&>td]:text-white [&>th]:text-amber-200 [&>th]:bg-amber-500/20">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{policyResult}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pitch Generation Loading */}
      {isPitchGenerating && (
        <div className="flex justify-center py-8 animate-fade-in">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
            <div className="font-light text-amber-400 tracking-wide animate-pulse">Creating your pitch deck...</div>
          </div>
        </div>
      )}

      {/* Pitch Generation Error */}
      {pitchError && (
        <Card className="border border-red-500/30 rounded-2xl bg-black/80 backdrop-blur-sm animate-slide-in-up shadow-2xl shadow-red-500/10">
          <CardHeader>
            <CardTitle className="text-red-400 font-light text-xl">Generation Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-300 font-light">{pitchError}</div>
          </CardContent>
        </Card>
      )}

      {/* Pitch Deck Results */}
      {pitchComplete && pitchResult && (
        <Card className="border border-amber-500/30 rounded-2xl bg-black/80 backdrop-blur-sm animate-slide-in-up shadow-2xl shadow-amber-500/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white font-light text-xl">Your Pitch Deck</CardTitle>
            <Button
              onClick={handleDownloadPitch}
              className="bg-green-600 hover:bg-green-700 text-white font-light px-4 py-2 rounded-lg transition-all duration-300"
            >
              <span className="mr-2">⬇</span>
              Download PDF
            </Button>
          </CardHeader>
          <CardContent className="max-w-none">
            <div className="prose prose-invert max-w-none text-white [&>*]:text-white [&>h1]:text-amber-300 [&>h2]:text-amber-300 [&>h3]:text-amber-200 [&>h4]:text-amber-200 [&>strong]:text-amber-100 [&>ul]:text-white [&>ol]:text-white [&>li]:text-white [&>p]:text-white [&>table]:text-white [&>td]:text-white [&>th]:text-amber-200 [&>th]:bg-amber-500/20">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{pitchResult}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
