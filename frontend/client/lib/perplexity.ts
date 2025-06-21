/*eslint-disable*/
export async function getPerplexityResearch(idea: string): Promise<any> {
  const res = await fetch('/api/perplexity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idea }),
  });
  if (!res.ok) throw new Error('Perplexity API error');
  const data = await res.json();
  return data;
} 