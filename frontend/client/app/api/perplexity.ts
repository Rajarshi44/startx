import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { idea } = req.body;
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing Perplexity API key' });

  try {
    const perplexityRes = await fetch('https://api.perplexity.ai/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'pplx-70b-online',
        messages: [
          { role: 'system', content: 'You are a startup research assistant.' },
          { role: 'user', content: `Research this startup idea: ${idea}\n\nReturn:\n- Market demand\n- SWOT analysis\n- Competitor analysis\n- Similar companies\n- Suggestions for improvement\n- Key analytics and scores` },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    const data = await perplexityRes.json();
    res.status(perplexityRes.status).json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Perplexity API error' });
  }
} 