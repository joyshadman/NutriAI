import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;
    
    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const { text } = await generateText({
      model: openrouter('google/gemini-2.0-flash-exp:free'),
      prompt: prompt,
    });

    return Response.json({ suggestion: text });
  } catch (error) {
    console.error('AI error:', error);
    return Response.json({ error: 'Failed to generate suggestion' }, { status: 500 });
  }
}
