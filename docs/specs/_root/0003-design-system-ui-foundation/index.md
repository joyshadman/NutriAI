# 0003. Design system and UI foundation

**Date**: 2026-11-17
**Status**: In Progress

## Summary

This sets how CalorieMeter AI looks and feels before the first real screens are built. You get one set of named values for type, color, spacing, and shape, plus a small set of shared components that own focus and keyboard behavior. Dark mode is in from the start, and an automated test guards the accessibility rules. Later slices build their screens from these pieces instead of inventing new buttons or spacing on each page.

## Requirements

**Done when:** `docs/design.md` covers type, color, spacing, and components, and the base components handle focus and keyboard.

**User stories**:
- As a person tracking meals, I want screens that look and behave the same way so that I can log food without relearning the interface.
- As the person building later slices, I want one set of tokens and components so that I do not reinvent buttons, forms, or focus styles in every feature.
- As a person using a keyboard or screen reader, I want every control reachable and named so that I can use the app fully.

**Acceptance criteria** (the contract, each independently checkable):
- **AC-1**: `docs/design.md` records the visual language and every value has a name used in code: type scale, typeface, color palette with light and dark sets, spacing scale, radii, shadows, focus ring, motion durations, and breakpoints.
- **AC-2**: Tailwind CSS 4 `@theme` in `app/globals.css` defines semantic tokens (names that describe purpose, such as `surface`, `text`, `accent`, `border`, and `focus`) that map to the palette. Components contain no raw color, spacing, or radius values.
- **AC-3**: The root layout loads a neutral modern sans through `next/font` with tabular numbers for calorie totals. A small inline script sets the theme class before paint so the first frame is not the wrong theme.
- **AC-4**: `components/ui/` exports Button, Input, Textarea, Select, Checkbox, Radio, Card, Badge, Spinner, Dialog, Dropdown menu, Toast, Container, Stack, Grid, and ThemeToggle. Each follows the component contract in `## Standard definition`.
- **AC-5**: Every interactive component defines default, hover, focus, active, disabled, loading or busy, and error or invalid states, plus selected or pressed where the component needs them. Focus is visible, a keyboard user can open, move through, and close overlays without a pointer, and text and control color pairs meet WCAG 2.2 AA contrast in both themes.
- **AC-6**: Components support composition with slots and `asChild` behavior, so a Button can render as a link without a new wrapper. Each control has an accessible name, and dialogs and toasts announce through a live region. Reduced motion and forced colors are respected.
- **AC-7**: Light and dark themes both work. The app follows the device preference until the user overrides it with ThemeToggle. The choice persists in `localStorage` and survives a reload.
- **AC-8**: Lint rules and Vitest with React Testing Library and axe run in CI. The suite checks focus, keyboard operation, and accessible names for every base component, axe fails on a control without an accessible name, and lint fails on invalid ARIA use.
- **AC-9**: Server components stay the default. Only components that need local state or browser events carry `use client`, and no base component loads client JavaScript purely for styling.

## Decision

**Chosen option**: Option 1: Document and enforce going forward.

The foundation is one CSS first token layer with semantic names, a small in house component set backed by Radix behavior, `next/font` type, lucide icons, and a Vitest plus axe guard.

**Implementation skills**: none installed. The skills in `.agents/skills/` are workflow skills, not UI skills.

## Standard definition

**Canonical pattern**:

```css
/* app/globals.css, token layer (named values every component reads) */
@import 'tailwindcss';
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --font-sans: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
  --color-surface: oklch(0.98 0.01 85);
  --color-surface-raised: oklch(1 0 0);
  --color-text: oklch(0.24 0.02 60);
  --color-text-muted: oklch(0.52 0.02 60);
  --color-accent: oklch(0.5 0.12 145);
  --color-accent-strong: oklch(0.42 0.11 145);
  --color-border: oklch(0.64 0.01 85);
  --color-danger: oklch(0.55 0.18 25);
  --color-focus: oklch(0.62 0.16 150);
  --radius-control: 0.5rem;
  --radius-card: 0.75rem;
  --shadow-card: 0 1px 2px oklch(0.3 0 0 / 0.08);
  --spacing-section: 2rem;
}

:root.dark {
  --color-surface: oklch(0.2 0.02 60);
  --color-surface-raised: oklch(0.26 0.02 60);
  --color-text: oklch(0.96 0.01 85);
  --color-text-muted: oklch(0.74 0.02 85);
  --color-accent: oklch(0.78 0.13 145);
  --color-accent-strong: oklch(0.72 0.14 145);
  --color-border: oklch(0.56 0.02 60);
  --color-danger: oklch(0.72 0.17 25);
  --color-focus: oklch(0.8 0.15 150);
  --shadow-card: 0 1px 2px oklch(0 0 0 / 0.4);
}
```

```tsx
// components/ui/button.tsx, canonical component contract
import { Slot } from '@radix-ui/react-slot';
import type { ComponentPropsWithoutRef } from 'react';

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
  loading?: boolean;
};

const variants = {
  primary: 'bg-accent text-surface-raised hover:bg-accent-strong',
  secondary: 'bg-surface-raised text-text border border-border',
  ghost: 'bg-transparent text-text hover:bg-surface',
  danger: 'bg-danger text-surface-raised',
};

export function Button({
  variant = 'primary',
  size = 'md',
  asChild = false,
  loading = false,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const forwarded = asChild
    ? {
        'aria-disabled': disabled || loading || undefined,
        'data-loading': loading || undefined,
      }
    : {
        disabled: disabled || loading,
        'aria-busy': loading || undefined,
      };
  return (
    <Comp
      className={`inline-flex items-center justify-center rounded-control px-4 py-2 \
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus \
        focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 ${variants[variant]} ${className}`}
      {...forwarded}
      {...rest}
    >
      {loading ? <Spinner aria-hidden /> : null}
      {children}
    </Comp>
  );
}
```

**Token contract**:
- Tokens live only in `@theme` and the dark override in `app/globals.css`. The same names and values are recorded in `docs/design.md`. Raw values appear only in those two places and in generated SVG attributes.
- Semantic names are `surface`, `surface-raised`, `text`, `text-muted`, `accent`, `accent-strong`, `border`, `danger`, and `focus`. The primitive palette behind them is a neutral ramp from 50 to 900, green 400 and 600, and red 500, all recorded in `docs/design.md`. The `border` values are set so a control boundary measures at least 3:1 against both surfaces in each theme: 3.18:1 and 3.36:1 in light, 3.88:1 and 3.34:1 in dark.
- Type uses Geist loaded with `next/font/google`, `variable: '--font-geist'`, `subsets: ['latin']`, and `display: 'swap'`. Weights are 400, 500, 600, and 700. The scale is 0.75rem, 0.875rem, 1rem, 1.125rem, 1.25rem, 1.5rem, and 2rem. The root layout applies `tabular-nums` so calorie totals line up.
- Spacing uses the Tailwind CSS 4 default ramp, with `--spacing-section` for section gaps. Radii are `--radius-control` for inputs and buttons and `--radius-card` for cards.
- Motion uses 150ms for state changes and 200ms for overlays, with `prefers-reduced-motion` turning transitions off. Focus is a 2px ring with a 2px offset in `--color-focus` and a surface colored offset ring. In `app/globals.css` add `@media (forced-colors: active) { :focus-visible { outline: 2px solid CanvasText; outline-offset: 2px; } }` so the ring becomes a system outline.
- Breakpoints are mobile first: sm 40rem, md 48rem, lg 64rem, xl 80rem, and 2xl 96rem. Grid uses one column by default, two from sm, and up to four from lg.

**Component contract**:
- Every component lives in `components/ui/` with a PascalCase file name and is exported from `components/ui/index.ts`. Components carry no business logic, no data fetching, and no feature copy.
- Props extend the matching native element props. Interaction components expose `variant`, `size`, `asChild`, `disabled`, and `loading`. Form controls also expose `error`, and menu or toggle pieces expose `selected` or `pressed`. Passing both `asChild` and `loading` is not allowed in this slice.
- `asChild` uses `@radix-ui/react-slot` so a Button can render as a link. In that case `disabled` and `aria-busy` are not forwarded, since they are invalid on a link. The component sends `aria-disabled` and `data-loading` instead. State styling comes from CSS pseudo classes and Radix data attributes, never from an inline style that encodes a theme value.
- State rules are fixed. Hover uses `--color-accent-strong` or `--color-surface`. Active uses `--color-accent-strong` with a small brightness reduction. Disabled uses `opacity-50` and a not allowed cursor. Loading sets `aria-busy` and shows Spinner. Error uses `--color-danger` for border and text plus `aria-invalid`. Selected and pressed read Radix `data-state` and use `--color-accent` for the border.
- Accessible names are required on every control. Dialog and Dropdown menu use `@radix-ui/react-dialog` and `@radix-ui/react-dropdown-menu` for focus trap, arrow key movement, and Escape close. Toast uses `@radix-ui/react-toast` with a Provider, Root, and Viewport whose `aria-label` is `Notifications`. Information toasts use `role="status"` and error toasts use `role="alert"`.
- Components are server components by default. Button, Input, Textarea, Card, Badge, Spinner, Container, Stack, and Grid stay server components. Dialog, Dropdown menu, Toast, ThemeToggle, Select, Checkbox, and Radio carry `use client` at their outermost file because they hold state or browser events.

**Component prop contracts**:
- Button, Input, and Textarea: native props plus `variant`, `size`, `loading`, and `error` where relevant. Only Button supports `asChild`.
- Select: `options: { value: string; label: string; disabled?: boolean }[]`, `value`, `onValueChange`, `placeholder`, and `error`.
- Checkbox: `checked`, `onCheckedChange`, `label`, `name`, and `error`. Radio: `value`, `onValueChange`, `items: { value: string; label: string }[]`, and `name`.
- Card: compound parts `Card`, `CardHeader`, `CardTitle`, `CardContent`, and `CardFooter`, each taking native element props and `className`.
- Badge: `variant` of `neutral`, `accent`, or `danger`. Spinner: `size` of `sm`, `md`, or `lg` and an optional `label` that defaults to `Loading`.
- Dialog: `open`, `onOpenChange`, `title`, `description`, `trigger`, and `children`. Dropdown menu: `trigger` plus `items: { label: string; onSelect: () => void; disabled?: boolean; destructive?: boolean }[]` and `align`.
- Toast: a `ToastProvider` at the app shell root and a `toast(message, { variant, duration })` helper with a 5000ms default duration. Grid: `columns` from 1 to 4, `gap`, and optional `smColumns` and `lgColumns`.
- Container: `size` of `sm`, `md`, or `lg`. Stack: `direction`, `gap`, `align`, and `justify`. ThemeToggle: native button props only.

**Layout contract**:
- Container centers content and uses the spacing tokens for horizontal padding. Stack takes a gap from the spacing scale and a row or column direction. Grid takes column counts from the breakpoint scale and a gap from the spacing scale.
- Layout primitives are server components and accept `className` for narrow adjustments that still use tokens.

**Theme contract**:
- The root `html` element gets the `dark` class when dark mode is active. Tailwind dark variants read that class.
- `cm-theme` in `localStorage` holds `system`, `light`, or `dark`, with `system` as the default when nothing is stored.
- A synchronous inline script in the `head` of the root layout is injected with `dangerouslySetInnerHTML`. It reads `cm-theme`, falls back to `window.matchMedia('(prefers-color-scheme: dark)').matches`, and toggles the class before first paint.
- ThemeToggle listens for `matchMedia` changes while the choice is `system`, so the class follows the device without a reload. It cycles system to light to dark to system, uses the lucide icons Monitor, Sun, and Moon, and sets `aria-label` to `Switch to light theme`, `Switch to dark theme`, or `Switch to system theme` based on the next state.

**Replaces**:
- Inline color values and arbitrary color classes in feature code.
- Focus styles written separately on each page or component.
- New wrappers around native elements just to change one style.
- Raw spacing values chosen per screen instead of the shared scale.

**Enforcement**:
- Runtime packages are `@radix-ui/react-slot`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-toast`, `@radix-ui/react-select`, `@radix-ui/react-checkbox`, `@radix-ui/react-radio-group`, and `lucide-react`.
- Test and style packages are `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `axe-core`, `@axe-core/react`, `jsdom`, `eslint-plugin-jsx-a11y`, and `prettier-plugin-tailwindcss`.
- ESLint uses the Next.js config plus `eslint-plugin-jsx-a11y` and flags risky ARIA patterns and invalid ARIA use. Axe is the gate for accessible names, since lint does not reliably catch a bare unlabeled button.
- Each component test asserts an accessible name, keyboard focus, state classes that follow props, and no axe violation in both light and dark themes. Overlay tests add Escape close and focus return. The Toast test asserts live region text. The theme test asserts persistence and the system default.
- Add `.github/workflows/ci.yml` running `npm run lint`, `npm run typecheck`, and `npx vitest run`. Prettier with the Tailwind plugin keeps class order stable. Token use outside the token layer is checked in review because no lint rule covers it today.

**Rollout**:
- Enforce immediately for new code. The repo has only an empty scaffold page and the Tailwind import today, so there is no migration. The scaffold page is replaced only when its own feature slice arrives.
- Land a thin thread first: tokens, font and theme wiring, Button, Container, ThemeToggle, and one axe test. Then add the remaining core and form components, then overlays and layout primitives, and finally the full test suite. `/develop` derives its ordered tasks from this sequence.

**Exceptions**:
- Raw values are allowed only in `app/globals.css`, `docs/design.md`, and generated SVG attributes.
- A third party widget may need its own overrides, and a feature may add a one off visual treatment, but it must still use semantic tokens and keep the shared focus ring.

## Consequences

**Positive**:
- Later slices pick from one visual language, so screens feel related without extra design work.
- Focus, keyboard, and naming behavior is solved once instead of in every feature.
- Dark mode is ready before screens exist, so no component needs a later theme rewrite.
- A small automated guard keeps accessibility mistakes out of review.

**Negative / tradeoffs**:
- The first slice is larger than a token only foundation because you chose the full component set and both themes.
- Radix and the test runner add dependencies and configuration that need care on upgrade.
- Two themes double the contrast checks for every new color choice.
- A shared API means a Button change can touch every later screen.

**Neutral**:
- `docs/design.md` and `app/globals.css` must stay in sync, so token changes land in both.
- No new environment variable or secret is needed.
- Storybook is not part of this decision and can be revisited after three feature slices.

## Follow-up

- [ ] Agent Skill and MCP discovery was deferred. Consider a Tailwind CSS or Radix Agent Skill, and an accessibility MCP server if one appears, so the agent follows real conventions instead of guesses.
- [ ] Verify current package versions before install, since no web check was run for this spec.
- [ ] Link `docs/design.md` from `AGENTS.md` through `/sync` so later tasks load the visual language.
- [ ] Revisit Storybook after the first three feature slices if visual review becomes painful.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).
