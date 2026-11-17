import { generateText } from 'ai';
import { withModelFallback } from '@/lib/ai';
import { getSession } from '@/lib/auth/session';
import { MissingEnvError } from '@/lib/env';
import { getClientIp, rateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { suggestionRequestSchema } from '@/lib/validators/ai';

const INSTRUCTIONS =
  'You are a nutrition coach helping someone lose weight. Suggest one healthy meal idea. ' +
  'Reply in two or three short sentences with the meal name, an approximate calorie count, ' +
  'and why it helps. Keep it practical and do not add a disclaimer.';

export async function POST(request: Request) {
  const session = await getSession();
  const identity = session?.user?.id ?? getClientIp(request);
  const limit = await rateLimit(`ai:suggest:${identity}`);

  if (!limit.success) {
    return Response.json(
      { error: 'Too many requests. Try again shortly.' },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders(limit),
          'Retry-After': String(
            Math.max(Math.ceil((limit.reset - Date.now()) / 1000), 1),
          ),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = suggestionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'A prompt of 1 to 2000 characters is required.' },
      { status: 400 },
    );
  }

  try {
    const { text } = await withModelFallback((model) =>
      generateText({
        model,
        instructions: INSTRUCTIONS,
        prompt: parsed.data.prompt,
      }),
    );

    return Response.json(
      { suggestion: text },
      { headers: rateLimitHeaders(limit) },
    );
  } catch (error) {
    if (error instanceof MissingEnvError) {
      console.error('[ai/suggest]', error.message);
      return Response.json(
        { error: 'AI suggestions are not configured.' },
        { status: 503 },
      );
    }

    console.error('[ai/suggest] failed', error);
    return Response.json(
      { error: 'Failed to generate a suggestion.' },
      { status: 502 },
    );
  }
}
