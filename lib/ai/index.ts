import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import type { LanguageModel } from 'ai';
import { optionalEnv, requireEnv } from '@/lib/env';

/**
 * Free model first, cheap paid model second, per the stack decision
 * (docs/specs/_root/0001-stack-and-architecture/index.md). Both are overridable
 * from the environment so a model can be swapped without a code change.
 */
export const AI_MODELS = Array.from(
  new Set([
    optionalEnv('OPENROUTER_MODEL', 'google/gemini-2.0-flash-exp:free'),
    optionalEnv('OPENROUTER_FALLBACK_MODEL', 'openai/gpt-4o-mini'),
  ]),
);

function model(modelId: string): LanguageModel {
  const openrouter = createOpenRouter({
    apiKey: requireEnv('OPENROUTER_API_KEY'),
  });
  return openrouter(modelId);
}

/**
 * Runs the call against each configured model in order and returns the first
 * success. A failure on the free model (rate limit, outage, unsupported
 * capability) falls through to the next one instead of failing the request.
 */
export async function withModelFallback<T>(
  run: (model: LanguageModel) => Promise<T>,
): Promise<T> {
  let lastError: unknown;

  for (const modelId of AI_MODELS) {
    try {
      return await run(model(modelId));
    } catch (error) {
      lastError = error;
      console.warn(`[ai] model ${modelId} failed, trying the next one`, error);
    }
  }

  throw lastError ?? new Error('No AI model is configured.');
}
