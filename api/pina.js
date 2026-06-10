export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message required' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: `You are Piña, the friendly AI assistant for Pour Decisions Juice Bar at 359 Northern Boulevard, Albany NY 12204. You help customers with menu questions and pricing: cold-pressed signature juices ($9-10), smoothies ($10-12), wellness shots ($4-5), fresh salads ($10-16, including Salmon Salad $16 grilled or baked and Shrimp Salad $15), and fresh wraps ($12-13), plus add-ons (avocado +$2, protein powder +$3, chia/flax +$1, extra fruit +$2) and combo deals (Juice + Salad $18, Smoothie + Wrap $20, add a wellness shot to any order +$3). Also help with hours (Mon-Sat 7am-7pm, Sun 8am-5pm), location info, nutritional questions, delivery (available on DoorDash and Uber Eats), and catering/large orders. Be warm, enthusiastic about health and wellness, and concise — you're in a chat widget. For large orders or catering, ask them to call the store. Keep responses under 4 sentences.`,
        messages: [
          ...history.slice(-6).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(502).json({ error: 'upstream error' });
    }

    const data = await response.json();
    res.json({ reply: data.content[0].text });
  } catch (e) {
    console.error('Pina handler error:', e);
    res.status(500).json({ error: 'internal error' });
  }
}
