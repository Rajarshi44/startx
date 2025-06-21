/*eslint-disable*/
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, CheckCircle, BarChart3, Lightbulb, Users, TrendingUp, FileText, ChevronDown, ChevronUp, ListChecks, RefreshCw } from 'lucide-react';
import { getPerplexityResearch } from '@/lib/perplexity';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

function parseMarketNumbers(text: string) {
  // Try to extract years and market sizes from the text
  // Example: $26.04 billion in 2025 to $48.27 billion by 2034
  const regex = /\$([\d.]+)\s*billion in (\d{4})[^\$]+\$([\d.]+)\s*billion (?:by|in) (\d{4})/i;
  const match = regex.exec(text);
  if (match) {
    return [
      { year: match[2], value: Number(match[1]) },
      { year: match[4], value: Number(match[3]) },
    ];
  }
  return null;
}

function parseSWOT(text: string) {
  // Parse markdown-style SWOT
  const strengths = text.match(/\*\*Strengths\*\*[\s\S]*?(?=(\*\*|$))/i)?.[0]?.replace(/\*\*Strengths\*\*/, '').split(/\n|\r/).filter(l => l.trim().startsWith('-') || l.trim().startsWith('•')).map(l => l.replace(/^[-•]\s*/, '').trim()) || [];
  const weaknesses = text.match(/\*\*Weaknesses\*\*[\s\S]*?(?=(\*\*|$))/i)?.[0]?.replace(/\*\*Weaknesses\*\*/, '').split(/\n|\r/).filter(l => l.trim().startsWith('-') || l.trim().startsWith('•')).map(l => l.replace(/^[-•]\s*/, '').trim()) || [];
  const opportunities = text.match(/\*\*Opportunities\*\*[\s\S]*?(?=(\*\*|$))/i)?.[0]?.replace(/\*\*Opportunities\*\*/, '').split(/\n|\r/).filter(l => l.trim().startsWith('-') || l.trim().startsWith('•')).map(l => l.replace(/^[-•]\s*/, '').trim()) || [];
  const threats = text.match(/\*\*Threats\*\*[\s\S]*?(?=(\*\*|$))/i)?.[0]?.replace(/\*\*Threats\*\*/, '').split(/\n|\r/).filter(l => l.trim().startsWith('-') || l.trim().startsWith('•')).map(l => l.replace(/^[-•]\s*/, '').trim()) || [];
  return { strengths, weaknesses, opportunities, threats };
}

function parseList(text: string) {
  // Parse markdown or bullet list
  return text.split(/\n|\r/).filter(l => l.trim().startsWith('-') || l.trim().startsWith('•')).map(l => l.replace(/^[-•]\s*/, '').trim());
}

const sectionIcons = {
  'Market Demand': <BarChart3 className="h-5 w-5" />,
  'SWOT Analysis': <ListChecks className="h-5 w-5" />,
  'Competitor Analysis': <TrendingUp className="h-5 w-5" />,
  'Similar Companies': <Users className="h-5 w-5" />,
  'Suggestions for Improvement': <FileText className="h-5 w-5" />,
  'Key Analytics and Scores': <CheckCircle className="h-5 w-5" />,
};

const steps = [
  { label: 'Describe Idea', icon: <Lightbulb className="h-5 w-5" /> },
  { label: 'Validating', icon: <Clock className="h-5 w-5 animate-spin" /> },
  { label: 'Results', icon: <CheckCircle className="h-5 w-5 text-green-600" /> },
];

export default function IdeaValidation() {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [step, setStep] = useState(0);

  const handleValidate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setStep(1);
    try {
      const data = await getPerplexityResearch(idea);
      setResult(data);
      setStep(2);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setIdea('');
    setResult(null);
    setError(null);
    setShowDetails(false);
    setOpenSections([]);
    setStep(0);
  };

  // Parse Perplexity response
  let analytics = null, swot = null, competitors = null, suggestions = null, similar = null, raw = null, marketDemand = null;
  if (result && result.choices && result.choices[0]?.message?.content) {
    const content = result.choices[0].message.content;
    // Updated regex to match markdown headers
    const regexMarket = /## Market Demand\s*([\s\S]*?)(?=^## |\n## |$)/im;
    const regexSwot = /## SWOT Analysis\s*([\s\S]*?)(?=^## |\n## |$)/im;
    const regexComp = /## Competitor Analysis\s*([\s\S]*?)(?=^## |\n## |$)/im;
    const regexSimilar = /## Similar Companies\s*([\s\S]*?)(?=^## |\n## |$)/im;
    const regexSuggestions = /## Suggestions for Improvement\s*([\s\S]*?)(?=^## |\n## |$)/im;
    const regexAnalytics = /## Key Analytics and Scores\s*([\s\S]*?)(?=^## |\n## |$)/im;
    marketDemand = regexMarket.exec(content)?.[1]?.trim();
    swot = regexSwot.exec(content)?.[1]?.trim();
    competitors = regexComp.exec(content)?.[1]?.trim();
    similar = regexSimilar.exec(content)?.[1]?.trim();
    suggestions = regexSuggestions.exec(content)?.[1]?.trim();
    analytics = regexAnalytics.exec(content)?.[1]?.trim();
    raw = content;
  }

  // Parse numbers for chart
  const marketChart = useMemo(() => marketDemand ? parseMarketNumbers(marketDemand) : null, [marketDemand]);
  // Parse SWOT
  const swotParsed = useMemo(() => swot ? parseSWOT(swot) : null, [swot]);
  // Parse competitors
  const competitorsList = useMemo(() => competitors ? parseList(competitors) : [], [competitors]);
  // Parse suggestions
  const suggestionsList = useMemo(() => suggestions ? parseList(suggestions) : [], [suggestions]);
  // Parse similar companies
  const similarList = useMemo(() => similar ? parseList(similar) : [], [similar]);

  // Section data for dynamic rendering
  const rawSections = [
    marketDemand && {
      key: 'Market Demand',
      content: (
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 min-w-[200px] h-40">
            {marketChart ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marketChart} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-500 italic">No chart data found</div>
            )}
          </div>
          <div className="flex-1 text-base text-indigo-900 dark:text-indigo-100 whitespace-pre-line font-medium">
            {marketDemand}
          </div>
        </div>
      ),
    },
    swotParsed && {
      key: 'SWOT Analysis',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="font-semibold text-blue-700 mb-1">Strengths</div>
            <ul className="list-disc ml-5 text-blue-900 dark:text-blue-100">
              {swotParsed.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div>
            <div className="font-semibold text-blue-700 mb-1">Weaknesses</div>
            <ul className="list-disc ml-5 text-blue-900 dark:text-blue-100">
              {swotParsed.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div>
            <div className="font-semibold text-blue-700 mb-1">Opportunities</div>
            <ul className="list-disc ml-5 text-blue-900 dark:text-blue-100">
              {swotParsed.opportunities.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div>
            <div className="font-semibold text-blue-700 mb-1">Threats</div>
            <ul className="list-disc ml-5 text-blue-900 dark:text-blue-100">
              {swotParsed.threats.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </div>
      ),
    },
    competitorsList.length > 0 && {
      key: 'Competitor Analysis',
      content: (
        <ul className="divide-y divide-yellow-200 dark:divide-yellow-700">
          {competitorsList.map((c, i) => (
            <li key={i} className="py-2 text-yellow-900 dark:text-yellow-100">{c}</li>
          ))}
        </ul>
      ),
    },
    similarList.length > 0 && {
      key: 'Similar Companies',
      content: (
        <div className="flex flex-wrap gap-2">
          {similarList.map((s, i) => (
            <Badge key={i} className="bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-100 px-3 py-1 rounded-full text-sm font-medium">
              {s}
            </Badge>
          ))}
        </div>
      ),
    },
    suggestionsList.length > 0 && {
      key: 'Suggestions for Improvement',
      content: (
        <ul className="list-inside list-disc text-orange-900 dark:text-orange-100">
          {suggestionsList.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      ),
    },
    analytics && {
      key: 'Key Analytics and Scores',
      content: (
        <div className="text-base text-green-900 dark:text-green-100 whitespace-pre-line font-medium">
          {analytics}
        </div>
      ),
    },
  ];
  // Type guard to filter out null/undefined/false
  const sections = rawSections.filter((s): s is any => Boolean(s));

  const toggleSection = (key: string) => {
    setOpenSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Stepper */}
      <div className="flex items-center justify-center gap-6 mb-8">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className={`rounded-full border-2 p-2 ${step === i ? 'border-purple-500 bg-purple-100' : 'border-gray-200 bg-white'} transition-all`}>{s.icon}</div>
            <span className={`text-base font-semibold ${step === i ? 'text-purple-700' : 'text-gray-400'}`}>{s.label}</span>
            {i < steps.length - 1 && <span className="w-8 h-1 bg-gradient-to-r from-purple-200 to-purple-400 rounded-full mx-2" />}
          </div>
        ))}
      </div>
      {/* Input Card */}
      {!result && (
        <Card className="backdrop-blur-lg bg-white/80 dark:bg-zinc-900/70 border-0 shadow-2xl rounded-3xl p-0 overflow-hidden max-w-2xl mx-auto">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-2xl font-extrabold text-purple-700">
              <Lightbulb className="h-6 w-6 text-purple-500" />
              Validate Your Startup Idea
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              Get instant AI-powered validation, analytics, and real web research
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div>
              <label className="text-base font-semibold mb-2 block text-gray-800 dark:text-gray-200">Your Startup Idea</label>
              <Textarea
                placeholder="Describe your startup idea, target market, and value proposition..."
                value={idea}
                onChange={e => setIdea(e.target.value)}
                rows={6}
                className="resize-none bg-white/60 dark:bg-zinc-800/60 border-2 border-purple-100 focus:border-purple-400 rounded-xl text-lg shadow-sm transition"
                disabled={loading}
              />
            </div>
            <Button
              onClick={handleValidate}
              disabled={!idea.trim() || loading}
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-lg px-8 py-3 rounded-xl shadow-lg transition-all duration-200 w-full"
            >
              {loading ? (
                <>
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Clock className="mr-2 h-5 w-5 animate-spin" />
                  </motion.span>
                  Validating & Researching...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                  Validate & Research
                </>
              )}
            </Button>
            {error && <div className="text-red-600 font-semibold text-base mt-2">{error}</div>}
            {/* Loading shimmer */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  key="shimmer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl bg-gradient-to-r from-purple-100 via-white to-purple-100 animate-pulse h-48 w-full mt-6"
                />
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}
      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-6 max-w-3xl mx-auto"
          >
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-zinc-900 dark:to-zinc-800 border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="pb-0 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl font-extrabold text-purple-700">
                    <Sparkles className="h-6 w-6 text-purple-500" />
                    Validation Results
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                    Here's what the AI and real web research found about your idea
                  </CardDescription>
                </div>
                <Button variant="ghost" onClick={handleReset} className="text-purple-600 hover:text-purple-800 flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Validate Another Idea
                </Button>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="summary">
                    <AccordionTrigger>Summary</AccordionTrigger>
                    <AccordionContent>
                      <div className="prose prose-purple max-w-none text-base">
                        {marketDemand && <ReactMarkdown>{marketDemand}</ReactMarkdown>}
                        {!(marketDemand || marketChart || swotParsed || competitorsList.length || similarList.length || suggestionsList.length || analytics) && (
                          <div className="text-red-600 font-semibold mt-4">No data could be parsed from the response. Please check your input or try again.</div>
                        )}
                      </div>
                      {/* Debug: Show raw response if everything is empty */}
                      {!(marketDemand || marketChart || swotParsed || competitorsList.length || similarList.length || suggestionsList.length || analytics) && raw && (
                        <div className="mt-6 p-4 bg-gray-100 dark:bg-zinc-900/60 rounded-xl text-xs text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 shadow-inner">
                          <div className="font-bold mb-2 text-red-700">Debug: Raw Perplexity Response</div>
                          <pre className="whitespace-pre-wrap break-all">{raw}</pre>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="market">
                    <AccordionTrigger>Market Graph</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1 min-w-[200px] h-60">
                          {marketChart ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={marketChart} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 6 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="text-gray-500 italic">No chart data found</div>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="swot">
                    <AccordionTrigger>SWOT</AccordionTrigger>
                    <AccordionContent>
                      {swotParsed ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="font-semibold text-blue-700 mb-1">Strengths</div>
                            <ul className="list-disc ml-5 text-blue-900 dark:text-blue-100">
                              {swotParsed.strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700 mb-1">Weaknesses</div>
                            <ul className="list-disc ml-5 text-blue-900 dark:text-blue-100">
                              {swotParsed.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700 mb-1">Opportunities</div>
                            <ul className="list-disc ml-5 text-blue-900 dark:text-blue-100">
                              {swotParsed.opportunities.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700 mb-1">Threats</div>
                            <ul className="list-disc ml-5 text-blue-900 dark:text-blue-100">
                              {swotParsed.threats.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                        </div>
                      ) : <div className="text-gray-500 italic">No SWOT data found</div>}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="competitors">
                    <AccordionTrigger>Competitors</AccordionTrigger>
                    <AccordionContent>
                      {competitorsList.length > 0 ? (
                        <ul className="divide-y divide-yellow-200 dark:divide-yellow-700">
                          {competitorsList.map((c, i) => (
                            <li key={i} className="py-2 text-yellow-900 dark:text-yellow-100">{c}</li>)
                          )}
                        </ul>
                      ) : <div className="text-gray-500 italic">No competitors found</div>}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="similar">
                    <AccordionTrigger>Similar</AccordionTrigger>
                    <AccordionContent>
                      {similarList.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {similarList.map((s, i) => (
                            <Badge key={i} className="bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-100 px-3 py-1 rounded-full text-sm font-medium">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      ) : <div className="text-gray-500 italic">No similar companies found</div>}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="suggestions">
                    <AccordionTrigger>Suggestions</AccordionTrigger>
                    <AccordionContent>
                      {suggestionsList.length > 0 ? (
                        <ul className="list-inside list-disc text-orange-900 dark:text-orange-100">
                          {suggestionsList.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      ) : <div className="text-gray-500 italic">No suggestions found</div>}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="analytics">
                    <AccordionTrigger>Analytics</AccordionTrigger>
                    <AccordionContent>
                      {analytics ? (
                        <div className="text-base text-green-900 dark:text-green-100 whitespace-pre-line font-medium">
                          <ReactMarkdown>{analytics}</ReactMarkdown>
                        </div>
                      ) : <div className="text-gray-500 italic">No analytics found</div>}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 