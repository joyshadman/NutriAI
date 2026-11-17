# 0003. Design system and UI foundation, rationale

## Context

> ⚠️ Premise note: This topic spans several pieces that could each be built alone: tokens, base components, overlays, dark mode, and tests. The scope treats them as one foundation, so this spec covers them together, and the build should land a thin end to end thread first before filling out the kit.

CalorieMeter AI has a Next.js 16 App Router scaffold with Tailwind CSS 4 imported and a blank page. There is no `design.md`, no component folder, and no visual direction to copy. Without a decision here, each slice picks its own colors, spacing, and focus styles, and the accessibility work is repeated or missed.

The stack spec chooses a small launch for you and a few friends, with privacy by default and few moving parts. That pushes this decision toward local, boring tools: CSS tokens, behavior primitives you host in the repo, and tests that need no browser service. No regulated data lives in this foundation, so the only formal bar is WCAG 2.2 AA.

No design source was available and no design tool was connected. You chose a calm clinic direction with warm neutrals and one fresh green accent, plus a neutral modern sans with tabular numbers. That direction is written into the spec so the build does not invent a look.

You first put dark mode on the out of scope list, then chose light and dark from day one. When asked, you confirmed dark mode is in scope, so it was removed from the out of scope list.

## Options considered

### Option 1: Document and enforce going forward

Write the standard in `docs/design.md` and `app/globals.css`, add lint rules and axe tests that fail CI, and apply them to all new code. The scaffold has almost no UI to fix, so there is no debt to carry.

**Pros**:
- Automated checks catch unlabeled controls and broken focus without a review meeting.
- The first slice stays close to the size of the actual work.
- New feature slices start compliant from their first commit.

**Cons**:
- Lint and axe do not judge whether a component looks right, so review is still needed for visual drift.
- The test runner and axe packages add setup and upgrade work.

### Option 2: Document and do a single migration pass

Write the standard, then convert every existing UI file to it in one coordinated change before any new feature work.

**Pros**:
- One clean point where the whole codebase complies.
- Easy to point at a single commit as the start of the new convention.

**Cons**:
- There is no UI to migrate today, so the pass would mostly create the same files as Option 1 with more ceremony.
- A big coordinated change blocks other work for no gain here.

### Option 3: Document only

Write the standard and rely on code review to hold it.

**Pros**:
- No tooling to install and no CI time to spend.
- Fastest path to a written decision.

**Cons**:
- Review misses small accessibility faults, especially missing names on controls.
- Consistency depends on whoever is reviewing that day, which is the failure mode this foundation exists to end.

## Rationale

Option 1 fits the force that matters most here: there is almost no existing UI, so enforcement can be built in from the first line of component code at low cost. A documented only standard would leave the exact mistakes this feature exists to prevent, and a migration pass would add a ceremony with nothing to migrate. Lint plus axe is the strongest feasible guard for a repo this size, and the remaining visual judgment is small enough for review.

Radix primitives were chosen because keyboard behavior and focus management are the parts developers most often get wrong. Styling stays in house so the calm clinic look owns every color and radius, and no vendor theme needs a later override. The full component set was your choice, so the first slice is wider than my smaller core only recommendation; the tradeoff is more code to maintain now in exchange for fewer decisions in the auth and tracking slices. Dark mode moved into scope on your confirmation, so its contrast work is part of this decision rather than a later surprise.

Several small values were mine to settle, since you asked for a direction rather than supplying one. The warm neutral palette with a green accent beat a coral accent because it reads as health focused without turning the food log into a bright marketing page, and it gives more room for accessible contrast pairs. A cross check caught that the first light green sat below AA contrast with white text, so the light accent was darkened to `oklch(0.5 0.12 145)` and the dark set was completed with matching danger, focus, accent, and shadow values. Geist through `next/font` with the default Tailwind type ramp beat a system stack because totals stay aligned and the look is the same on every device. The default spacing ramp with a 0.75rem card radius beat a fully custom scale because there is less to learn and fewer values to keep in sync with `docs/design.md`. Mobile first Tailwind breakpoints beat custom device names because the first real use is a phone heavy tracker. A 2px focus ring with an offset beat an outline alone because it stays visible on both light and dark surfaces. The `cm-theme` storage key with system as the default beat a class only approach because it respects the device first and still survives a reload. The `asChild` component API beat variant props alone because links and buttons need one shared treatment in navigation and cards.
