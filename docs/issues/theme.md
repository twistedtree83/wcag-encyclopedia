## Parent

#1

## What to build

The theme toggle in the header, wired to the palettes that already exist.

The page opens in whatever the reader's OS is set to. An explicit choice from the toggle
overrides that and persists across page loads. The override must win in both directions — a
reader on a dark OS who picks light gets light on their next visit, not dark.

No flash of the wrong theme on load.

## Acceptance criteria

- [ ] With no stored preference, the page matches the OS `prefers-color-scheme` setting
- [ ] The toggle switches themes and updates its own label to name the action, not the state
- [ ] An explicit choice persists across reloads
- [ ] An explicit choice wins over the OS setting in both directions
- [ ] No flash of the wrong theme before hydration
- [ ] The toggle is keyboard operable with a visible focus indicator
- [ ] The token contrast audit passes for both palettes
- [ ] The axe scan passes in both themes

## Blocked by

- #2 — Walking skeleton: build, token palettes, one criterion card, contrast audit, CI
