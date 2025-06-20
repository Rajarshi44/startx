import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, CheckCircle, BarChart3, Lightbulb, Users, TrendingUp, FileText } from 'lucide-react';
import { getPerplexityResearch } from '@/lib/perplexity';

export default function IdeaValidation() {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleValidate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await getPerplexityResearch(idea);
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Parse Perplexity response (assume data.choices[0].message.content is markdown or structured text)
  let analytics = null, swot = null, competitors = null, suggestions = null, similar = null, raw = null;
  if (result && result.choices && result.choices[0]?.message?.content) {
    const content = result.choices[0].message.content;
    // Simple parsing for demo: split by sections
    const regex = /Market demand:([\s\S]*?)(SWOT analysis:|$)/i;
    const regexSwot = /SWOT analysis:([\s\S]*?)(Competitor analysis:|$)/i;
    const regexComp = /Competitor analysis:([\s\S]*?)(Similar companies:|$)/i;
    const regexSimilar = /Similar companies:([\s\S]*?)(Suggestions for improvement:|$)/i;
    const regexSuggestions = /Suggestions for improvement:([\s\S]*?)(Key analytics and scores:|$)/i;
    const regexAnalytics = /Key analytics and scores:([\s\S]*)$/i;
    analytics = regexAnalytics.exec(content)?.[1]?.trim();
    swot = regexSwot.exec(content)?.[1]?.trim();
    competitors = regexComp.exec(content)?.[1]?.trim();
    suggestions = regexSuggestions.exec(content)?.[1]?.trim();
    similar = regexSimilar.exec(content)?.[1]?.trim();
    raw = content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="mr-2 h-5 w-5 text-purple-600" />
          Idea Validation & Research
        </CardTitle>
        <CardDescription>
          Describe your startup idea and get AI-powered validation, analytics, and real web research
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Your Startup Idea</label>
          <Textarea
            placeholder="Describe your startup idea, target market, and value proposition..."
            value={idea}
            onChange={e => setIdea(e.target.value)}
            rows={6}
            className="resize-none"
            disabled={loading}
          />
        </div>
        <Button
          onClick={handleValidate}
          disabled={!idea.trim() || loading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Validating & Researching...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Validate & Research
            </>
          )}
        </Button>
        {error && <div className="text-red-600 font-medium">{error}</div>}
        {result && (
          <div className="space-y-6">
            {/* Analytics & Scores */}
            {analytics && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Validation Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-green-900 whitespace-pre-line">{analytics}</div>
                </CardContent>
              </Card>
            )}
            {/* SWOT */}
            {swot && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    SWOT Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-900 whitespace-pre-line">{swot}</CardContent>
              </Card>
            )}
            {/* Competitors */}
            {competitors && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-800">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Competitor Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-yellow-900 whitespace-pre-line">{competitors}</CardContent>
              </Card>
            )}
            {/* Similar Companies */}
            {similar && (
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-800">
                    <Users className="mr-2 h-5 w-5" />
                    Similar Companies
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-purple-900 whitespace-pre-line">{similar}</CardContent>
              </Card>
            )}
            {/* Suggestions */}
            {suggestions && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-800">
                    <FileText className="mr-2 h-5 w-5" />
                    Suggestions for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-orange-900 whitespace-pre-line">{suggestions}</CardContent>
              </Card>
            )}
            {/* Expandable Research Details */}
            <div>
              <Button variant="outline" onClick={() => setShowDetails(v => !v)}>
                {showDetails ? 'Hide' : 'Show'} Research Details
              </Button>
              {showDetails && (
                <div className="mt-4 p-4 bg-gray-50 rounded text-xs text-gray-700 whitespace-pre-line border">
                  {raw}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 