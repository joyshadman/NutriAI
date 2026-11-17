# 0003. Design system and UI foundation, verify

Use these steps with `/check verify design system & UI foundation`. Each step names the criterion it proves.

- Read `docs/design.md`: it lists the exact type scale and weights, the primitive palette, color with light and dark sets, spacing, radii, shadows, focus ring, motion, and breakpoints, and each name appears in `app/globals.css`. Proves **AC-1** and **AC-2**.
- Run `npm run build` and load the app with JavaScript enabled and disabled. The font loads, there is no flash of the wrong theme, and the first paint matches the stored or device choice. Proves **AC-3**.
- Import every export from `components/ui/` in a scratch server component and confirm the list in **AC-4**. Proves **AC-4**.
- Render a Button with `asChild` as a link. It has no `disabled` or `aria-busy`, and it carries `aria-disabled` when told to be disabled. Proves **AC-6**.
- Tab through a page using Button, Input, Dialog, Dropdown menu, and Toast. Focus is visible, overlays trap focus and close with Escape, and no pointer is needed. Proves **AC-5** and **AC-6**.
- Check text and control contrast in both themes with a contrast tool, then turn on forced colors and reduced motion. Contrast reaches AA, an outline replaces the ring, and transitions stop. Proves **AC-5** and **AC-6**.
- Toggle dark mode, reload, and confirm the choice persists. Set the choice back to system and confirm the class follows the device preference live when the setting changes. Proves **AC-7**.
- Run `npm run lint`, `npm run typecheck`, and the Vitest suite with axe. All pass, a deliberately unlabeled button fails axe, and invalid ARIA fails lint. Confirm `.github/workflows/ci.yml` runs the same three commands. Proves **AC-8**.
- Search the component files for `use client`: only the stateful components named in the contract have it, and no client boundary exists purely for styling. Proves **AC-9**.
