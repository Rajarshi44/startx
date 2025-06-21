import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const { idea, civicId, companyId, requestType = 'validation' } = await req.json();
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing Perplexity API key' }, { status: 500 });
  }

  // Create Supabase client
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  // Get user ID if civicId provided
  let userId = null;
  if (civicId) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('civic_id', civicId)
      .single();
    
    if (user) {
      userId = user.id;
    }
  }

  // Check for existing validation/research based on type
  if (userId && requestType === 'validation') {
    const { data: existing, error: fetchError } = await supabase
      .from('idea_validations')
      .select('*')
      .eq('user_id', userId)
      .eq('idea_text', idea)
      .single();
    if (existing && existing.validation_result) {
      return NextResponse.json(JSON.parse(existing.validation_result), { status: 200 });
    }
  }

  // Generate prompts based on request type
  let systemPrompt = 'You are an expert startup research assistant with access to real-time data. Provide comprehensive, actionable insights with specific data points, sources, and scoring.';
  let userPrompt = '';

  switch (requestType) {
    case 'validation':
      userPrompt = `Analyze this startup idea comprehensively with real-time data: "${idea}"\n\nProvide a detailed analysis with the following structure and INCLUDE SOURCE LINKS:\n\n## Executive Summary\n- **Overall Viability Score: X/10** with detailed justification\n- Key strengths (top 3) and main concerns (top 3)\n- Market readiness assessment with timeline\n- Investment attractiveness rating\n\n## Market Demand Analysis\n- **Total Addressable Market (TAM):** $X billion [source](URL)\n- **Serviceable Addressable Market (SAM):** $X billion\n- **Serviceable Obtainable Market (SOM):** $X million\n- Current market size and 5-year CAGR with data sources\n- Market trends and drivers with specific statistics\n- Customer demand validation and documented pain points\n- Market timing analysis (too early/perfect timing/too late)\n\n## SWOT Analysis with Scoring\n**Strengths (Impact Score: X/10):**\n- Unique value propositions vs competitors\n- Competitive advantages and moats\n- Market timing benefits and first-mover advantages\n- Team/technology advantages\n\n**Weaknesses (Risk Score: X/10):**\n- Resource requirements and burn rate estimates\n- Skill gaps and key dependencies\n- Technical or operational risks\n- Market penetration challenges\n\n**Opportunities (Potential Score: X/10):**\n- Market gaps and underserved segments\n- Technology trends and emerging enablers\n- Partnership and scaling possibilities\n- Adjacent market expansion potential\n\n**Threats (Severity Score: X/10):**\n- Direct and indirect competition with funding levels\n- Market saturation and commoditization risks\n- Regulatory, economic, or technological disruption threats\n- Customer acquisition and retention challenges\n\n## Competitive Landscape Analysis\n| Company | Market Focus | Last Funding | Valuation | Strengths | Market Share | Source |\n|---------|-------------|-------------|-----------|-----------|-------------|--------|\n[Include 5-7 main competitors with verifiable data and source links]\n\n## Success Case Studies\n- **Company 1:** [Name](source) - Founded 20XX, Current valuation $X billion\n  - Key success factors and timeline\n  - Applicable lessons for this idea\n- **Company 2:** [Name](source) - Founded 20XX, Current valuation $X million\n  - Growth trajectory and funding rounds\n  - Strategic insights and differentiation\n- **Company 3:** [Name](source) - Founded 20XX, Exit/IPO details\n  - Market validation approach\n  - Scaling strategies employed\n\n## Detailed Scoring Matrix\n**Market Demand (30% weight):** X/10\n- Market size and growth: X/10\n- Customer pain severity: X/10\n- Market timing: X/10\n\n**Competition (25% weight):** X/10\n- Competitive intensity: X/10\n- Differentiation potential: X/10\n- Barriers to entry: X/10\n\n**Feasibility (25% weight):** X/10\n- Technical feasibility: X/10\n- Resource requirements: X/10\n- Regulatory complexity: X/10\n\n**Growth Potential (20% weight):** X/10\n- Scalability: X/10\n- Market expansion: X/10\n- Network effects: X/10\n\n**OVERALL SCORE: X.X/10**\n\n## Actionable Roadmap\n**Phase 1: Validation (0-6 months)**\n1. Market research and customer interviews (budget: $X)\n2. MVP development and testing (timeline: X months)\n3. Initial traction metrics to achieve\n\n**Phase 2: Launch (6-18 months)**\n1. Product launch and early adopter acquisition\n2. Funding strategy and investor targets\n3. Team expansion priorities\n\n**Phase 3: Scale (18-36 months)**\n1. Market expansion and growth strategies\n2. Strategic partnerships and business development\n3. Long-term competitive positioning\n\n## Risk Mitigation Strategies\n- **High-risk factors:** Specific mitigation plans\n- **Medium-risk factors:** Monitoring and contingency plans\n- **Success metrics:** KPIs to track progress\n\n## Investment Thesis\n- **Funding requirements:** $X for 18-month runway\n- **Expected returns:** X% IRR potential\n- **Comparable valuations:** Industry multiples and benchmarks\n- **Exit scenarios:** IPO/acquisition potential and timeline\n\nCite ALL sources with direct links [source name](URL). Focus on recent data from credible sources like Crunchbase, industry reports, government data, academic studies, and company press releases.`;
      break;

    case 'policy':
      userPrompt = `Research public policies and government implementations for this startup: "${idea}"\n\nProvide comprehensive policy research with specific article references and direct official source links. Structure with markdown headers and CITE EVERY CLAIM:\n\n## Executive Policy Summary\n- **Policy Landscape Score: X/10** (supportive/neutral/challenging)\n- Top 3 most relevant policies with direct impact assessment\n- Key regulatory considerations and compliance timeline\n- Overall government support level for this sector\n\n## Federal Government Policies & Programs\n**Current Legislation:**\n- [Policy Name](official-.gov-link) - Enacted [Date] - Impact: [Specific benefits/requirements]\n- [Policy Name](official-.gov-link) - Enacted [Date] - Impact: [Specific benefits/requirements]\n\n**Active Federal Programs:**\n- **[Program Name](application-link)** - Funding: $X available, Deadline: [Date]\n  - Eligibility criteria specific to your startup type\n  - Application requirements and success rates\n- **[Program Name](application-link)** - Tax incentives: X% credit/deduction\n  - Qualifying activities and documentation needed\n\n**SBA Resources:**\n- [SBA Program](sba.gov-link) - Loan guarantees up to $X million\n- [SBIR/STTR Programs](sbir.gov-link) - Grant opportunities for R&D\n\n## Regulatory Compliance Framework\n**Federal Requirements:**\n- **[Regulatory Agency](agency-website):** [Specific regulation](regulation-link)\n  - Compliance timeline: X months\n  - Associated costs: $X,XXX\n  - Required documentation: [List]\n\n**Industry-Specific Regulations:**\n- [Industry Regulation](regulator-website) - Key provisions affecting your business model\n- [Safety/Security Requirements](agency-link) - Certification processes and costs\n\n**Licensing Requirements:**\n- Federal licenses: [License Type](application-portal) - Processing time: X weeks\n- Professional certifications: [Certification](certifying-body-link)\n\n## State & Local Policy Analysis\n**Business-Friendly States (Top 3):**\n1. **[State Name](state-website):**\n   - [Tax Incentive Program](state-link) - X% tax credit for [qualifying activities]\n   - [Grant Program](application-link) - Up to $X funding available\n   - Regulatory environment: [Assessment with specific policies]\n\n2. **[State Name](state-website):**\n   - [Economic Development Program](state-link)\n   - Special economic zones and benefits\n\n**Local Government Programs:**\n- [City/County Program](local-gov-link) - Local tax abatements and incentives\n- Municipal startup support programs and resources\n\n## Success Case Studies with Policy Support\n**Case 1: [Company Name](news-article-link)**\n- Founded: 20XX in [Location]\n- Government support received: [Specific programs](program-links)\n- Funding obtained: $X million through [Program Name]\n- Policy impact: [Specific benefits and outcomes]\n- Current status: [Valuation/IPO/Acquisition details]\n\n**Case 2: [Company Name](government-press-release-link)**\n- Government partnership: [Agency](agency-link)\n- Policy benefits utilized: [Specific tax incentives/grants]\n- Regulatory advantages: [Fast-track approvals/special designations]\n- Measurable outcomes: [Jobs created, revenue growth]\n\n**Case 3: [Company Name](industry-report-link)**\n- International comparison: How US policies helped vs other countries\n- Multi-program benefits: [Combination of federal/state/local support]\n\n## Implementation Roadmap with Timelines\n**Immediate Actions (0-30 days):**\n1. Register for [Program Name](registration-link) - Deadline: [Date]\n2. Begin [Compliance Process](agency-portal) - Timeline: X weeks\n3. Contact [Agency Contact](contact-info) for guidance\n\n**Short-term (1-6 months):**\n1. Submit applications for [Grant Program](application-link)\n2. Complete [Certification Process](certifying-body)\n3. Establish state registration in [Recommended State](state-portal)\n\n**Long-term (6-24 months):**\n1. Leverage [Tax Incentive Program](irs-link) for R&D activities\n2. Apply for [Advanced Program](application-link) after demonstrating traction\n3. Explore international expansion with [Trade Programs](trade-gov-link)\n\n## Financial Impact Analysis\n**Direct Financial Benefits:**\n- Federal tax credits: Up to $X annually\n- Grant funding potential: $X,XXX-$X,XXX,XXX\n- Loan guarantee amounts: Up to $X million at X% interest\n\n**Compliance Costs:**\n- Regulatory compliance: $X,XXX-$XX,XXX annually\n- Professional services: $X,XXX for legal/accounting\n- Certification costs: $X,XXX one-time\n\n**Net Benefit Analysis:**\n- Year 1: Net benefit/cost of $XXX,XXX\n- Years 2-5: Projected cumulative benefit of $X,XXX,XXX\n\n## Policy Risk Assessment\n**Political Risks (X/10):**\n- Election cycle impacts on program funding\n- Regulatory changes and sunset clauses\n\n**Compliance Risks (X/10):**\n- Audit likelihood and consequences\n- Evolving regulatory requirements\n\n## Expert Contacts & Resources\n- **[Government Agency](contact-page):** Direct contact for [Specific Program]\n- **[Industry Association](website):** Policy advocacy and updates\n- **[Legal/Consulting Firm](website):** Specialists in [Relevant Regulation]\n- **[Trade Organization](website):** Industry-specific policy guidance\n\nAll sources must be from official .gov websites, established news outlets, or verified industry publications. Include direct quotes from policy documents where relevant and cite publication dates for all sources.`;
      break;

    case 'pitch':
      userPrompt = `Create a comprehensive pitch deck content for this startup idea: ${idea}\n\nReturn a complete pitch deck with the following slides, each with a markdown header (## Slide X: Title):\n\n## Slide 1: Title Slide\n- Company name, tagline, date, contact info\n\n## Slide 2: Problem Statement\n- Clear problem definition with statistics\n- Market pain points\n\n## Slide 3: Solution\n- How your product/service solves the problem\n- Unique value proposition\n\n## Slide 4: Market Opportunity\n- Market size (TAM, SAM, SOM)\n- Growth projections\n\n## Slide 5: Product/Service\n- Key features and benefits\n- Demo or screenshots description\n\n## Slide 6: Business Model\n- Revenue streams\n- Pricing strategy\n\n## Slide 7: Traction\n- Key metrics and milestones\n- Customer testimonials\n\n## Slide 8: Competition\n- Competitive landscape\n- Competitive advantages\n\n## Slide 9: Marketing Strategy\n- Go-to-market strategy\n- Customer acquisition plan\n\n## Slide 10: Financial Projections\n- Revenue projections (3-5 years)\n- Key financial metrics\n\n## Slide 11: Team\n- Key team members and their expertise\n- Advisory board\n\n## Slide 12: Funding Ask\n- Amount needed\n- Use of funds breakdown\n- Expected outcomes\n\n## Slide 13: Contact Information\n- How to reach the team\n- Next steps\n\nMake each slide detailed but concise. Include specific numbers, statistics, and compelling narratives where possible.`;
      break;

    default:
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  }

  try {
    const perplexityRes = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    const contentType = perplexityRes.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await perplexityRes.text();
      return NextResponse.json({ error: 'Perplexity API did not return JSON', details: text }, { status: 500 });
    }

    const data = await perplexityRes.json();

    // Extract score from the content if available (mainly for validation)
    let score = null;
    let sources: string[] = [];
    let sourceDetails: Array<{url: string, title: string, context: string}> = [];
    
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      const content = data.choices[0].message.content;
      const scoreMatch = content.match(/score[:\s]*(\d+(?:\.\d+)?)/i);
      if (scoreMatch) {
        score = parseFloat(scoreMatch[1]);
      }
      
      // Extract sources from markdown links with titles
      const sourceLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
      let sourceLinkMatch: RegExpExecArray | null;
      while ((sourceLinkMatch = sourceLinkRegex.exec(content))) {
        const url = sourceLinkMatch[2];
        const title = sourceLinkMatch[1];
        
        if (!sources.includes(url)) {
          sources.push(url);
          
          // Extract context around this reference
          const linkIndex = content.indexOf(sourceLinkMatch[0]);
          const contextStart = Math.max(0, linkIndex - 100);
          const contextEnd = Math.min(content.length, linkIndex + sourceLinkMatch[0].length + 100);
          const context = content.substring(contextStart, contextEnd)
            .split('\n')
            .find((line: string) => line.includes(sourceLinkMatch![0])) || title;
          
          sourceDetails.push({
            url: url,
            title: title,
            context: context.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()
          });
        }
      }
      
      // Extract sources from citations
      const citationRegex = /(?:Sources?|References?):\s*[\s\S]*?(https?:\/\/[^\s\n]+)/gi;
      let citationMatch;
      while ((citationMatch = citationRegex.exec(content))) {
        const url = citationMatch[1];
        if (!sources.includes(url)) {
          sources.push(url);
          sourceDetails.push({
            url: url,
            title: new URL(url).hostname.replace('www.', ''),
            context: 'Referenced in citations'
          });
        }
      }
      
      // Also extract any citations that appear in the format [1], [2], etc. and match them with URLs
      const numberedCitationRegex = /\[(\d+)\]/g;
      const citationUrls = content.match(/(?:^\d+\.\s*|^\[\d+\]\s*)(https?:\/\/[^\s\n]+)/gm);
      if (citationUrls) {
        citationUrls.forEach((citation: string) => {
          const urlMatch = citation.match(/(https?:\/\/[^\s\n]+)/);
          if (urlMatch && !sources.includes(urlMatch[1])) {
            sources.push(urlMatch[1]);
            sourceDetails.push({
              url: urlMatch[1],
              title: new URL(urlMatch[1]).hostname.replace('www.', ''),
              context: citation.replace(/(https?:\/\/[^\s\n]+)/, '').trim() || 'Cited reference'
            });
          }
        });
      }
    }

    // Store the result based on type
    if (userId) {
      if (requestType === 'validation') {
        await supabase.from('idea_validations').insert([
          { 
            user_id: userId, 
            company_id: companyId || null,
            idea_text: idea, 
            validation_result: JSON.stringify(data),
            score: score,
            perplexity_response: data
          }
        ]);
      } else if (requestType === 'policy') {
        await supabase.from('policy_research').upsert([
          { 
            user_id: userId, 
            company_id: companyId || null,
            idea_text: idea, 
            research_result: JSON.stringify(data),
            perplexity_response: data,
            sources: sources,
            source_details: sourceDetails,
            updated_at: new Date().toISOString()
          }
        ], { 
          onConflict: 'user_id,idea_text',
          ignoreDuplicates: false 
        });
             } else if (requestType === 'pitch') {
         await supabase.from('pitch_decks').insert([
           { 
             user_id: userId, 
             company_id: companyId || null,
             company_name: 'Startup',
             pitch_content: JSON.stringify(data),
             perplexity_response: data
           }
         ]);
       }
    }

    return NextResponse.json(data, { status: perplexityRes.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Perplexity API error' }, { status: 500 });
  }
}