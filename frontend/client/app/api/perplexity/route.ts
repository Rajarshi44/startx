/*eslint-disable*/
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
  let systemPrompt = 'Be precise and concise. You are a startup research assistant.';
  let userPrompt = '';

  switch (requestType) {
    case 'validation':
      userPrompt = `Research this startup idea: ${idea}\n\nReturn the following sections, each with a markdown header (## Section Name):\n\n## Market Demand\n- Market size, growth, trends, and drivers.\n\n## SWOT Analysis\n- Strengths, Weaknesses, Opportunities, Threats (use markdown subheadings or bold).\n\n## Competitor Analysis\n- Table of main competitors, their focus, and strengths.\n\n## Similar Companies\n- Bullet list of similar companies.\n\n## Suggestions for Improvement\n- Bullet list of actionable suggestions.\n\n## Key Analytics and Scores\n- Key numbers, growth rates, audience segments, and trends.\n\nAlways include all sections, even if some are empty. Use markdown formatting for tables, lists, and bold text. Be concise but thorough.`;
      break;

    case 'policy':
      userPrompt = `Research public policies and government implementations related to this startup idea: ${idea}\n\nReturn comprehensive policy research with the following sections, each with a markdown header (## Section Name). IMPORTANT: Include direct links to official sources wherever possible using markdown link format [source name](URL):\n\n## Relevant Government Policies\n- List current policies that support or affect this type of business\n- Include policy names, dates, key provisions, and official links\n- Link to official government websites and policy documents\n\n## Government Initiatives & Programs\n- Startup incubators, accelerators, and support programs with official websites\n- Funding schemes and grants available (include application links)\n- Tax incentives and benefits with IRS or government links\n- SBA programs and resources\n\n## Regulatory Compliance\n- Key regulations and compliance requirements with regulatory body links\n- Licensing and registration needs (link to application portals)\n- Industry-specific regulations with agency websites\n- Federal, state, and local requirements\n\n## Success Stories\n- Examples of similar startups that benefited from government support\n- Case studies with verifiable sources and links\n- Government press releases and success announcements\n\n## Implementation Timeline\n- Step-by-step process for applications with official forms/links\n- Timeline expectations for different programs\n- Contact information for relevant agencies\n\n## Regional Variations\n- Different policies by state/region with state government links\n- Local government initiatives and economic development programs\n- State-specific incentives and programs\n\nALWAYS include direct citations and source links. Use format: [Policy/Program Name](official-website-url) throughout your response. Prioritize .gov, .edu, and official organization websites. Include at least 5-10 authoritative source links.`;
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