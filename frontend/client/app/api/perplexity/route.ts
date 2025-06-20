import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const { idea, userId } = await req.json();
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing Perplexity API key' }, { status: 500 });
  }

  // Create Supabase client
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  // 1. Check for existing validation
  if (userId) {
    const { data: existing, error: fetchError } = await supabase
      .from('idea_validations')
      .select('*')
      .eq('user_id', userId)
      .eq('idea', idea)
      .single();
    if (existing && existing.result) {
      return NextResponse.json(existing.result, { status: 200 });
    }
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
          { role: 'system', content: 'Be precise and concise. You are a startup research assistant.' },
          { role: 'user', content: `Research this startup idea: ${idea}\n\nReturn the following sections, each with a markdown header (## Section Name):\n\n## Market Demand\n- Market size, growth, trends, and drivers.\n\n## SWOT Analysis\n- Strengths, Weaknesses, Opportunities, Threats (use markdown subheadings or bold).\n\n## Competitor Analysis\n- Table of main competitors, their focus, and strengths.\n\n## Similar Companies\n- Bullet list of similar companies.\n\n## Suggestions for Improvement\n- Bullet list of actionable suggestions.\n\n## Key Analytics and Scores\n- Key numbers, growth rates, audience segments, and trends.\n\nAlways include all sections, even if some are empty. Use markdown formatting for tables, lists, and bold text. Be concise but thorough.` },
        ],
      }),
    });

    const contentType = perplexityRes.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await perplexityRes.text();
      return NextResponse.json({ error: 'Perplexity API did not return JSON', details: text }, { status: 500 });
    }

    const data = await perplexityRes.json();

    // 2. Store the result
    if (userId) {
      await supabase.from('idea_validations').insert([
        { user_id: userId, idea, result: data }
      ]);
    }

    return NextResponse.json(data, { status: perplexityRes.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Perplexity API error' }, { status: 500 });
  }
}