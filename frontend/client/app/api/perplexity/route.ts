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
      userPrompt = `Research public policies and government implementations related to this startup idea: ${idea}\n\nReturn the following sections, each with a markdown header (## Section Name):\n\n## Relevant Government Policies\n- List current policies that support or affect this type of business\n- Include policy names, dates, and key provisions\n\n## Government Initiatives & Programs\n- Startup incubators, accelerators, and support programs\n- Funding schemes and grants available\n- Tax incentives and benefits\n\n## Regulatory Compliance\n- Key regulations and compliance requirements\n- Licensing and registration needs\n- Industry-specific regulations\n\n## Success Stories\n- Examples of similar startups that benefited from government support\n- Case studies of policy implementation\n\n## Implementation Timeline\n- How long it typically takes to access these benefits\n- Step-by-step process for applications\n\n## Regional Variations\n- Different policies by state/region if applicable\n- Local government initiatives\n\nAlways include all sections, even if some are empty. Use markdown formatting for tables, lists, and bold text. Focus on actionable information.`;
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
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      const content = data.choices[0].message.content;
      const scoreMatch = content.match(/score[:\s]*(\d+(?:\.\d+)?)/i);
      if (scoreMatch) {
        score = parseFloat(scoreMatch[1]);
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