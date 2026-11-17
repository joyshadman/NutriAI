/**
 * Zod bounds for the data model, shared by forms and server actions so the app
 * rejects what the database constraints would reject, with a readable message.
 *
 * Values are trimmed here and again by the database constraints, so a name is
 * never stored with leading or trailing whitespace.
 */

import { z } from 'zod';

export const mealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack']);

export const mealSourceSchema = z.enum(['manual', 'photo', 'ai_suggestion']);

export const unitsSchema = z.enum(['metric', 'imperial']);

/** A food name or serving label. Same 1 to 200 bound on both columns. */
export const labelSchema = z.string().trim().min(1).max(200);

/** Calories per serving, or an item's snapshot. Whole numbers only. */
export const caloriesSchema = z.number().int().nonnegative();

/** Protein, carbs, or fat in grams. Null is allowed on the nullable columns. */
export const macroSchema = z.number().nonnegative();
export const optionalMacroSchema = macroSchema.nullable().optional();

/** How many servings an item contributed. Must be greater than zero. */
export const quantitySchema = z.number().positive();

/** A goal's daily calorie target. Must be greater than zero. */
export const dailyCaloriesSchema = z.number().int().positive();

/** A goal's per macro target, when the user sets one. */
export const macroTargetSchema = macroSchema.nullable().optional();

export type MealType = z.infer<typeof mealTypeSchema>;
export type MealSource = z.infer<typeof mealSourceSchema>;
export type Units = z.infer<typeof unitsSchema>;
