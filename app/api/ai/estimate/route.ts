import { generateText, Output } from 'ai';
import { withModelFallback } from '@/lib/ai';
import { getSession } from '@/lib/auth/session';
import { MissingEnvError } from '@/lib/env';
import { getClientIp, rateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { assertValidPhoto, InvalidPhotoError } from '@/lib/storage';
import { mealEstimateSchema } from '@/lib/validators/ai';

const INSTRUCTIONS =
  'You estimate the nutrition of a meal from a photo. Give the meal a short name, ' +
  'then estimate total calories (kcal) and grams of protein, carbs, and fat. ' +
  'If the photo is unclear, still give your best estimate.';

export async function POST(request: Request) {
  const session = await getSession();
  const identity = session?.user?.id ?? getClientIp(request);
  const limit = await rateLimit(`ai:estimate:${identity}`);

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

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json(
      {
        error: 'Send the photo as multipart form data under the "image" field.',
      },
      { status: 400 },
    );
  }

  const image = form.get('image');
  if (!(image instanceof File)) {
    return Response.json(
      { error: 'An image file is required.' },
      { status: 400 },
    );
  }

  try {
    assertValidPhoto(image);
    const bytes = new Uint8Array(await image.arrayBuffer());

    const { output } = await withModelFallback((model) =>
      generateText({
        model,
        output: Output.object({ schema: mealEstimateSchema }),
        instructions: INSTRUCTIONS,
        messages: [
          {
            role: 'user',
            content: [{ type: 'file', mediaType: image.type, data: bytes }],
          },
        ],
      }),
    );

    return Response.json(
      { estimate: output },
      { headers: rateLimitHeaders(limit) },
    );
  } catch (error) {
    if (error instanceof InvalidPhotoError) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof MissingEnvError) {
      console.error('[ai/estimate]', error.message);
      return Response.json(
        { error: 'Photo estimates are not configured.' },
        { status: 503 },
      );
    }

    console.error('[ai/estimate] failed', error);
    return Response.json(
      { error: 'Failed to estimate the meal.' },
      { status: 502 },
    );
  }
}
