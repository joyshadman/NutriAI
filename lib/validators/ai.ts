import { z } from 'zod';

export const suggestionRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(2000),
});

export const mealEstimateSchema = z.object({
  name: z.string().min(1),
  calories: z.number().int().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
});

export type MealEstimate = z.infer<typeof mealEstimateSchema>;
