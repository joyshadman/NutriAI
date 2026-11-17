-- Row level security and the app role.
--
-- The running app connects as `nutriai_app`: a role that does not own these
-- tables and is not a member of `neon_superuser` (which carries BYPASSRLS).
-- Every app query goes through `withUser`, which sets `app.user_id` for the
-- transaction, and these policies read that setting.
--
-- Better Auth tables (`users`, `sessions`, `accounts`, `verifications`) keep
-- RLS off, because Better Auth queries them without a user context. App code
-- still filters by the session user, and better auth tables are granted below.

-- 1. The app role. Created here so a fresh database needs no console step, but
-- its password never lives in the repo. If you already created the role in the
-- Neon console, this is a no op.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'nutriai_app') THEN
    CREATE ROLE nutriai_app LOGIN;
  END IF;
END
$$;
--> statement-breakpoint

-- 2. The app role must not inherit BYPASSRLS. Neon gives it to its owner role,
-- so drop the membership when that role exists on this cluster.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'neon_superuser') THEN
    EXECUTE 'REVOKE neon_superuser FROM nutriai_app';
  END IF;
END
$$;
--> statement-breakpoint

-- 3. Privileges. The app role reads and writes rows, but the policies decide
-- which rows. Future tables get the same grants.
GRANT USAGE ON SCHEMA public TO nutriai_app;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  users,
  sessions,
  accounts,
  verifications,
  meals,
  meal_items,
  foods,
  goals
TO nutriai_app;
--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO nutriai_app;
--> statement-breakpoint

-- 4. Policies. With no `app.user_id` set, `current_setting(..., true)` is null
-- and every policy denies, so a query outside `withUser` sees nothing.
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

DROP POLICY IF EXISTS meals_user_isolation ON meals;
--> statement-breakpoint
CREATE POLICY meals_user_isolation ON meals
  FOR ALL
  USING (user_id = nullif(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (user_id = nullif(current_setting('app.user_id', true), '')::uuid);
--> statement-breakpoint

DROP POLICY IF EXISTS foods_user_isolation ON foods;
--> statement-breakpoint
CREATE POLICY foods_user_isolation ON foods
  FOR ALL
  USING (user_id = nullif(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (user_id = nullif(current_setting('app.user_id', true), '')::uuid);
--> statement-breakpoint

DROP POLICY IF EXISTS goals_user_isolation ON goals;
--> statement-breakpoint
CREATE POLICY goals_user_isolation ON goals
  FOR ALL
  USING (user_id = nullif(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (user_id = nullif(current_setting('app.user_id', true), '')::uuid);
--> statement-breakpoint

-- A meal item resolves ownership through its parent meal.
DROP POLICY IF EXISTS meal_items_user_isolation ON meal_items;
--> statement-breakpoint
CREATE POLICY meal_items_user_isolation ON meal_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM meals m
      WHERE m.id = meal_items.meal_id
        AND m.user_id = nullif(current_setting('app.user_id', true), '')::uuid
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM meals m
      WHERE m.id = meal_items.meal_id
        AND m.user_id = nullif(current_setting('app.user_id', true), '')::uuid
    )
  );
--> statement-breakpoint

-- 5. Assert the role cannot bypass the policies. A missing role or an inherited
-- BYPASSRLS means the policies are decorative, so fail the migration loudly.
DO $$
DECLARE
  bypass boolean;
BEGIN
  SELECT rolbypassrls INTO bypass FROM pg_roles WHERE rolname = 'nutriai_app';

  IF bypass IS NULL THEN
    RAISE EXCEPTION 'Role nutriai_app is missing, so the policies cannot be enforced.';
  END IF;

  IF bypass THEN
    RAISE EXCEPTION 'Role nutriai_app has BYPASSRLS, so the policies would never run. Revoke it and apply again.';
  END IF;
END
$$;
