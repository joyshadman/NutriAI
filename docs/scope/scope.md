# Scope: CalorieMeter AI

A healthy calories meter AI for people who want to lose weight. Track meals, get AI powered suggestions, and build lasting habits.

**Build approach:** Tracer Bullet (vertical slices; each feature built end to end through every layer, working)

**Workflow:** Beta (after /develop, /check verify then /test; best for most real products)

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack & architecture | Foundation | in-progress |
| 2 | Coding standards & tooling | Foundation | planned |
| 3 | Data model | Foundation | planned |
| 4 | Design system & UI foundation | Foundation | planned |
| 5 | Auth & onboarding | Slice 1 | planned |
| 6 | Calorie tracking | Slice 2 | planned |
| 7 | AI meal suggestions | Slice 3 | planned |
| 8 | Goals & history | Slice 4 | planned |

## 1. Stack & architecture · in-progress

Decide the tech stack and scaffold a runnable project so every later slice builds on real structure.

**Done when:** the stack is recorded in a spec and the empty scaffold boots locally and passes build.

- [x] Decide the stack (spec): `/architect stack & architecture`
- [ ] Build it: `/develop stack & architecture`
  - [ ] Scaffold Next.js with chosen services wired
  - [ ] Add auth, DB, and AI wiring
  - [ ] Set up blob storage and rate limiting
- [ ] Verify it: `/check verify stack & architecture`
- [ ] Test it: `/test stack & architecture`

Spec [0001](../specs/_root/0001-stack-and-architecture.md) · code in `./`

## 2. Coding standards & tooling · planned

Capture conventions, then install lint, format, and precommit enforcement from the real scaffolded project.

**Done when:** root `AGENTS.md` reflects the real stack, and lint/format/precommit run clean.

- [ ] Capture conventions + tooling choices: `/audit`
- [ ] Install the tooling: `/develop tooling`
- [ ] Check it runs clean: `/test`

## 3. Data model · planned

Core entities every feature builds on: users, meals, daily entries, food items.

**Done when:** entities and relationships support later slices (AI suggestions, goals, history) without a migration that breaks.

- [ ] Design it (spec): `/architect data model`
- [ ] Build it: `/develop data model`
   - [ ] Schema + constraints: tables, keys, unique/check, cascades
   - [ ] Row-level security: per table policies + helpers
   - [ ] Apply migration, confirm live, generate types
- [ ] Verify it: `/check verify data model`
- [ ] Test it: `/test data model`

Spec 0002 · code (filled by /develop)

## 4. Design system & UI foundation · planned

Visual language, layout primitives, and base components so the flows feel cohesive and accessible.

**Done when:** `design.md` covers type/color/spacing/components, and base components handle focus and keyboard.

- [ ] Design it (spec): `/architect design system & UI foundation`

## 5. Auth & onboarding · planned · needs a decision

Sign in, sign up, and profile setup so users can start tracking.

**Done when:** a user can sign up, sign in, and set a basic profile.

- [ ] Design it (spec): `/architect auth & onboarding`

## 6. Calorie tracking · planned

Add a meal entry, view daily total, and edit or delete entries.

**Done when:** a user can add a meal with calories, see the daily total, and edit or remove an entry.

- [ ] Design it (spec): `/architect calorie tracking`

## 7. AI meal suggestions · planned

Get AI powered meal suggestions based on remaining daily calories.

**Done when:** the AI suggests a meal and the user can accept or dismiss it.

- [ ] Design it (spec): `/architect AI meal suggestions`

## 8. Goals & history · planned

Set daily calorie goals and view tracking history.

**Done when:** a user can set a daily calorie goal and view past entries by date.

- [ ] Design it (spec): `/architect goals & history`

## Legend

**The decision box.** Every feature carries exactly one, the sub-task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally, `Decide the stack (spec)` on Stack & architecture), so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle:** the scope updates as a feature moves; each row is what it shows and who sets it:

- `planned` · needs a decision → `/scope` → one box: `Design it (spec): /architect <feature>`
- `in-progress` (designed) → `/architect` at spec capture → `Design it` ticked; spec linked; `Build it: /develop <feature>` + 2 to 5 milestones; tier's closing boxes
- `in-progress` (building) → `/develop` → milestone sub-boxes tick one by one; code pointer filled
- `in-progress` (verified) → `/check verify` → `Build it` + milestones ticked; `Verify it` ticked
- `done` → you, when you decide it is; `/sync` reconciles; boxes you ran ticked, skipped ones marked skipped; the tier's last stage (`Prototype` → after `/develop`; `Alpha` → after `/check verify`; `Beta`/`GA` → after `/test`) is the suggested point to call it done

**Status** `planned` to `in progress` to `done`, plus `existing` (pre-workflow) and `dropped` (de-scoped, kept for history).

**Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag = inherits it.

**Workflow tier tag** beside a heading (e.g. `· GA`, `· Prototype`) sets that one feature's rigor above or below the project default; no tag inherits the default. It decides the feature's check boxes and each skill's next suggestion.

**Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.

## /scope complete

**2 features planned** (8 total on scope, 0 already on the scope, 0 deferred), build approach Tracer Bullet, workflow Beta.

Next: `/clear`, then `/architect stack & architecture`, or `/audit` if a brownfield repo has no root `AGENTS.md`

Heads up: this is a new greenfield product; foundational features (stack, data model, auth) must be completed before feature slices can advance. Auth and compliance features may warrant a GA workflow override as the product matures.

Scope written to `docs/scope/scope.md`.