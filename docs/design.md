---
name: calm-clinic-design-system
source: derived
character: "A calm, clinical interface with warm paper neutrals and one fresh green accent. Dense enough for daily food logging, quiet enough that the numbers stay the focus. Nothing shouts, everything is reachable, and the same small set of shapes repeats across every screen."
tokens: "The values below are mirrored in app/globals.css. That file is the single source of truth used by the code; this page is the readable record and the art direction."
contrast: "Light: text 15.58 to 1, muted 5.23 to 1, white on accent 5.69 to 1, focus 3.21 to 1, danger 5.32 to 1, border 3.18 to 1 on surface. Dark: text 16.16 to 1, muted 7.87 to 1, raised on accent 8.17 to 1, focus 10.28 to 1, danger 5.84 to 1, border 3.34 to 1 on raised."
---

## Build mandate

You are a senior product designer. Every page ships as a complete, professional product surface. That means real product copy, a considered layout with hierarchy, all states (empty, loading, error), supporting content, and a footer where the page warrants one. The accent marks primary actions only. Never leave a lone form floating on an empty page, and never hide a control without a visible state change.

## Character and direction

CalorieMeter AI should feel like a trusted clinician's notebook rather than a gadget dashboard. The canvas is a warm near white in the light theme and a deep warm charcoal in the dark theme. There is one green accent, used for the primary action, selected states, and the focus ring. Red is reserved for destructive actions and validation errors. Borders are quiet but strong enough to outline a control. Cards use a hairline shadow, never a heavy drop shadow. Type is a neutral modern sans with tabular figures, so calorie totals line up in columns.

## Type

Geist is loaded through `next/font/google` with the variable `--font-geist`, the latin subset, and `display: swap`. The root layout applies tabular numbers so calorie totals align.

| Step | Name in code | Size | Line height |
|---|---|---|---|
| Caption | `text-xs` | 0.75rem | 1rem |
| Small | `text-sm` | 0.875rem | 1.25rem |
| Body | `text-base` | 1rem | 1.5rem |
| Ledger | `text-lg` | 1.125rem | 1.75rem |
| Title small | `text-xl` | 1.25rem | 1.75rem |
| Title | `text-2xl` | 1.5rem | 2rem |
| Display | `text-3xl` | 2rem | 2.5rem |

Weights are 400 regular, 500 medium, 600 semibold, and 700 bold. Tight letter spacing is reserved for display sizes above 2rem.

## Color

The primitive palette behind the semantic names is a neutral ramp from 50 to 900, green 400 and 600, and red 500. Components never use the primitive names. They read the semantic names below.

| Name in code | Purpose | Light value | Dark value |
|---|---|---|---|
| `surface` | Page background | oklch(0.98 0.01 85) | oklch(0.2 0.02 60) |
| `surface-raised` | Cards, inputs, popovers | oklch(1 0 0) | oklch(0.26 0.02 60) |
| `text` | Primary text and headings | oklch(0.24 0.02 60) | oklch(0.96 0.01 85) |
| `text-muted` | Captions, hints, placeholders | oklch(0.52 0.02 60) | oklch(0.74 0.02 85) |
| `accent` | Primary action, selected state | oklch(0.5 0.12 145) | oklch(0.78 0.13 145) |
| `accent-strong` | Accent hover and active | oklch(0.42 0.11 145) | oklch(0.72 0.14 145) |
| `border` | Control outlines and dividers | oklch(0.64 0.01 85) | oklch(0.56 0.02 60) |
| `danger` | Destructive action, invalid field | oklch(0.55 0.18 25) | oklch(0.72 0.17 25) |
| `focus` | Focus ring | oklch(0.62 0.16 150) | oklch(0.8 0.15 150) |

The border values were chosen so a control boundary reaches at least 3 to 1 against both the page surface and a raised surface in each theme. Contrast was recomputed for every pair in both themes and the results are recorded in the front matter above.

## Spacing

Spacing follows the Tailwind CSS 4 default ramp, which is built on a 4px base unit with an 8px rhythm. There is one named extension for larger gaps.

| Name in code | Value | Use |
|---|---|---|
| default ramp | 0.25rem steps | Padding, margins, gaps, icon sizes |
| `section` | 2rem | Space between major sections |

Reach a 44 by 44 touch target with padding on the control rather than by changing its visual size.

## Radii and shadows

| Name in code | Value | Use |
|---|---|---|
| `control` | 0.5rem | Buttons, inputs, selects, textareas |
| `card` | 0.75rem | Cards, dialogs, popovers |
| `full` | 9999px | Badges and avatars |
| `card` shadow | 0 1px 2px oklch(0.3 0 0 / 0.08) | Cards in the light theme |
| `card` shadow dark | 0 1px 2px oklch(0 0 0 / 0.4) | Cards in the dark theme |

## Focus ring

Focus is a 2px ring with a 2px offset. The ring uses `focus` and the offset uses `surface`, so it stays distinct in both themes. A default outline is only removed when this ring takes its place. Under forced colors the ring becomes a 2px `CanvasText` outline with a 2px offset.

## Motion

State changes use 150ms with a standard ease of `cubic-bezier(0.2, 0, 0.2, 1)`. Overlays use 200ms. Reduced motion turns transitions and animations off. Motion never carries meaning on its own.

## Breakpoints and layout

The system is mobile first.

| Name | Width |
|---|---|
| `sm` | 40rem |
| `md` | 48rem |
| `lg` | 64rem |
| `xl` | 80rem |
| `2xl` | 96rem |

Grid uses one column by default, two from `sm`, and up to four from `lg`. The Container constrains line length and centers content. Stack handles one dimensional rhythm.

## Composition patterns

Pages are assembled from Container, Stack, Grid, and Card. A page opens with one primary heading, followed by a short supporting line, then the functional core in cards or a grid. Overlays use Dialog and Dropdown menu so focus and Escape behavior come from the platform primitives. Toast sits at the app shell root and announces through a live region named Notifications.

## Component and usage rules

Use the accent for the single primary action in a view. Secondary actions use the surface with a border, and quiet actions use the ghost treatment. Danger is only for destructive or invalid states. Selected and pressed controls read their state from the primitive and use the accent border. Every control has an accessible name, every field has a persistent label, and error text is tied to its field. Composition uses Radix Slot through `asChild` so a Button can render as a link without a new wrapper. Server components stay the default. Only components that hold state or listen to browser events carry `use client`.

## Responsive and accessibility direction

All components meet WCAG 2.2 AA in both themes. Check the light and dark palettes separately when adding a color. Focus is visible on keyboard navigation, overlays trap focus and close with Escape, and no information is carried by color alone. Under reduced motion and forced colors the same components stay usable without custom overrides.
