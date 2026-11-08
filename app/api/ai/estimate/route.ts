import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return Response.json({ error: 'Image is required' }, { status: 400 });
    }

    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${image.type};base64,${base64}`;

    const { text } = await generateText({
      model: openrouter('google/gemini-2.0-flash-exp:free'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Estimate calories and macronutrients for this meal. Return JSON with name, calories, protein, carbs, fat.' },
            { type: 'image', image: dataUrl },
          ],
        },
      ],
    });

    return Response.json({ estimate: text });
  } catch (error) {
    console.error('AI vision error:', error);
    return Response.json({ error: 'Failed to estimate meal' }, { status: 500 });
  }
}
