CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "foods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"serving" text NOT NULL,
	"calories" integer NOT NULL,
	"protein" numeric(6, 1),
	"carbs" numeric(6, 1),
	"fat" numeric(6, 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "foods_name_length_check" CHECK (char_length(btrim("foods"."name")) between 1 and 200),
	CONSTRAINT "foods_serving_length_check" CHECK (char_length(btrim("foods"."serving")) between 1 and 200),
	CONSTRAINT "foods_calories_check" CHECK ("foods"."calories" >= 0),
	CONSTRAINT "foods_protein_check" CHECK ("foods"."protein" >= 0),
	CONSTRAINT "foods_carbs_check" CHECK ("foods"."carbs" >= 0),
	CONSTRAINT "foods_fat_check" CHECK ("foods"."fat" >= 0)
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"daily_calories" integer NOT NULL,
	"protein_target" numeric(6, 1),
	"carbs_target" numeric(6, 1),
	"fat_target" numeric(6, 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "goals_daily_calories_check" CHECK ("goals"."daily_calories" > 0),
	CONSTRAINT "goals_protein_target_check" CHECK ("goals"."protein_target" >= 0),
	CONSTRAINT "goals_carbs_target_check" CHECK ("goals"."carbs_target" >= 0),
	CONSTRAINT "goals_fat_target_check" CHECK ("goals"."fat_target" >= 0)
);
--> statement-breakpoint
CREATE TABLE "meal_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meal_id" uuid NOT NULL,
	"food_id" uuid,
	"name" text NOT NULL,
	"quantity" numeric(6, 2) DEFAULT 1 NOT NULL,
	"calories" integer NOT NULL,
	"protein" numeric(6, 1),
	"carbs" numeric(6, 1),
	"fat" numeric(6, 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "meal_items_quantity_check" CHECK ("meal_items"."quantity" > 0),
	CONSTRAINT "meal_items_calories_check" CHECK ("meal_items"."calories" >= 0),
	CONSTRAINT "meal_items_protein_check" CHECK ("meal_items"."protein" >= 0),
	CONSTRAINT "meal_items_carbs_check" CHECK ("meal_items"."carbs" >= 0),
	CONSTRAINT "meal_items_fat_check" CHECK ("meal_items"."fat" >= 0)
);
--> statement-breakpoint
CREATE TABLE "meals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"label" text,
	"meal_type" text NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"notes" text,
	"eaten_at" timestamp with time zone DEFAULT now() NOT NULL,
	"local_date" date NOT NULL,
	"photo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "meals_meal_type_check" CHECK ("meals"."meal_type" in ('breakfast', 'lunch', 'dinner', 'snack')),
	CONSTRAINT "meals_source_check" CHECK ("meals"."source" in ('manual', 'photo', 'ai_suggestion'))
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"units" text DEFAULT 'metric' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_units_check" CHECK ("users"."units" in ('metric', 'imperial'))
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "foods" ADD CONSTRAINT "foods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meals" ADD CONSTRAINT "meals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "foods_user_id_idx" ON "foods" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "foods_user_name_serving_unique" ON "foods" USING btree ("user_id", lower(btrim("name")), lower(btrim("serving")));--> statement-breakpoint
CREATE UNIQUE INDEX "goals_user_id_unique" ON "goals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "meal_items_meal_id_idx" ON "meal_items" USING btree ("meal_id");--> statement-breakpoint
CREATE INDEX "meal_items_food_id_idx" ON "meal_items" USING btree ("food_id");--> statement-breakpoint
CREATE INDEX "meals_user_id_local_date_idx" ON "meals" USING btree ("user_id","local_date");