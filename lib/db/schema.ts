import { sql, relations } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

// `users`, `sessions`, `accounts`, and `verifications` are owned by Better Auth.
// This feature adds `timezone` and `units` to `users` and leaves its timestamps
// as plain `timestamp`, matching what Better Auth expects.

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name'),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    timezone: text('timezone').default('UTC').notNull(),
    units: text('units').default('metric').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    check('users_units_check', sql`${table.units} in ('metric', 'imperial')`),
  ],
);

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
});

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const verifications = pgTable('verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// `meals` is the eating event. Its items hold the calorie snapshot, so a day's
// total is a query over items grouped by the meal's local date, never a stored
// rollup and never a join back to `foods`.

export const meals = pgTable(
  'meals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    label: text('label'),
    mealType: text('meal_type').notNull(),
    source: text('source').default('manual').notNull(),
    notes: text('notes'),
    eatenAt: timestamp('eaten_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    localDate: date('local_date').notNull(),
    photoUrl: text('photo_url'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('meals_user_id_local_date_idx').on(table.userId, table.localDate),
    check(
      'meals_meal_type_check',
      sql`${table.mealType} in ('breakfast', 'lunch', 'dinner', 'snack')`,
    ),
    check(
      'meals_source_check',
      sql`${table.source} in ('manual', 'photo', 'ai_suggestion')`,
    ),
  ],
);

// Items are immutable snapshots. Editing a meal deletes and reinserts its items,
// so a later food edit never rewrites a past item.

export const mealItems = pgTable(
  'meal_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    mealId: uuid('meal_id')
      .references(() => meals.id, { onDelete: 'cascade' })
      .notNull(),
    foodId: uuid('food_id').references(() => foods.id, {
      onDelete: 'set null',
    }),
    name: text('name').notNull(),
    quantity: numeric('quantity', { precision: 6, scale: 2, mode: 'number' })
      .default(1)
      .notNull(),
    calories: integer('calories').notNull(),
    protein: numeric('protein', { precision: 6, scale: 1, mode: 'number' }),
    carbs: numeric('carbs', { precision: 6, scale: 1, mode: 'number' }),
    fat: numeric('fat', { precision: 6, scale: 1, mode: 'number' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('meal_items_meal_id_idx').on(table.mealId),
    index('meal_items_food_id_idx').on(table.foodId),
    check('meal_items_quantity_check', sql`${table.quantity} > 0`),
    check('meal_items_calories_check', sql`${table.calories} >= 0`),
    check('meal_items_protein_check', sql`${table.protein} >= 0`),
    check('meal_items_carbs_check', sql`${table.carbs} >= 0`),
    check('meal_items_fat_check', sql`${table.fat} >= 0`),
  ],
);

// `foods` is a per user catalog. The unique index trims and lowercases the name
// and serving pair so "Greek Yogurt, 100 g" and "greek yogurt , 100 G" collide.

export const foods = pgTable(
  'foods',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(),
    serving: text('serving').notNull(),
    calories: integer('calories').notNull(),
    protein: numeric('protein', { precision: 6, scale: 1, mode: 'number' }),
    carbs: numeric('carbs', { precision: 6, scale: 1, mode: 'number' }),
    fat: numeric('fat', { precision: 6, scale: 1, mode: 'number' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('foods_user_id_idx').on(table.userId),
    uniqueIndex('foods_user_name_serving_unique').on(
      sql`${table.userId}, lower(btrim(${table.name})), lower(btrim(${table.serving}))`,
    ),
    check(
      'foods_name_length_check',
      sql`char_length(btrim(${table.name})) between 1 and 200`,
    ),
    check(
      'foods_serving_length_check',
      sql`char_length(btrim(${table.serving})) between 1 and 200`,
    ),
    check('foods_calories_check', sql`${table.calories} >= 0`),
    check('foods_protein_check', sql`${table.protein} >= 0`),
    check('foods_carbs_check', sql`${table.carbs} >= 0`),
    check('foods_fat_check', sql`${table.fat} >= 0`),
  ],
);

// `goals` holds the one active goal per user.

export const goals = pgTable(
  'goals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    dailyCalories: integer('daily_calories').notNull(),
    proteinTarget: numeric('protein_target', {
      precision: 6,
      scale: 1,
      mode: 'number',
    }),
    carbsTarget: numeric('carbs_target', {
      precision: 6,
      scale: 1,
      mode: 'number',
    }),
    fatTarget: numeric('fat_target', {
      precision: 6,
      scale: 1,
      mode: 'number',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('goals_user_id_unique').on(table.userId),
    check('goals_daily_calories_check', sql`${table.dailyCalories} > 0`),
    check('goals_protein_target_check', sql`${table.proteinTarget} >= 0`),
    check('goals_carbs_target_check', sql`${table.carbsTarget} >= 0`),
    check('goals_fat_target_check', sql`${table.fatTarget} >= 0`),
  ],
);

export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  meals: many(meals),
  foods: many(foods),
  goal: one(goals),
}));

export const mealsRelations = relations(meals, ({ one, many }) => ({
  user: one(users, {
    fields: [meals.userId],
    references: [users.id],
  }),
  items: many(mealItems),
}));

export const mealItemsRelations = relations(mealItems, ({ one }) => ({
  meal: one(meals, {
    fields: [mealItems.mealId],
    references: [meals.id],
  }),
  food: one(foods, {
    fields: [mealItems.foodId],
    references: [foods.id],
  }),
}));

export const foodsRelations = relations(foods, ({ one, many }) => ({
  user: one(users, {
    fields: [foods.userId],
    references: [users.id],
  }),
  items: many(mealItems),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));
