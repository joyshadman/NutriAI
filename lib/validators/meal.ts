import { z } from 'zod';

export const mealSchema = z.object({
  name: z.string().min(1),
  calories: z.number().int().positive(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
  mealDate: z.date().optional(),
});

export const goalSchema = z.object({
  dailyCalories: z.number().int().positive(),
});
