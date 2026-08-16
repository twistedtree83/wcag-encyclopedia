## Parent

#1

## What to build

The tracer bullet: a deployable static page that renders exactly one criterion card, with the
test and CI machinery that every later slice inherits. Thin, but it cuts through every layer —
build, tokens, data, rendering, tests, CI.

Vite + TypeScript, building to a static site. Both theme palettes defined as data and emitted
as CSS custom properties, using the token names from the design file verbatim so the design and
the build stay diffable. One criterion — **1.4.1 Use of Color** — authored as a typed record and
rendered through the card component that all 55 criteria will later use.

The criterion record shape is fixed by the design:

```
{ num: '1.4.3', name: 'Contrast (Minimum)', level: 'AA', guideline: '1.4',
  plain: '…',                    // plain-English restatement
  fail: { render, caption },     // what's wrong
  pass: { render, caption },     // what changed
  diff?: { lines, note },        // optional markup diff
  demo?: DemoId }                // optional linked demo
```

Also lands the **contrast engine**: WCAG relative luminance and contrast ratio as pure, total
functions over colour values, with no dependencies. It has two consumers — the token audit test
here, and the computed on-card ratio badges later — so keep it free of any rendering concern.

This slice sets the conventions 23 other issues inherit. Prefer boring and explicit.

## Acceptance criteria

- [ ] `npm install && npm run build` produces a static site that opens and renders the 1.4.1 card
- [ ] Both light and dark palettes are defined as data and emitted as CSS custom properties
- [ ] The dark palette redefines existing tokens only; it introduces no colour without a light counterpart
- [ ] Token names match the design file exactly
- [ ] Contrast engine exposes a ratio function that is pure and dependency-free
- [ ] A test enumerates every foreground/background token pair that actually occurs, in both themes, and asserts 4.5:1 for body text and 3:1 for UI and large text
- [ ] That test's failure output names the offending pair and its measured ratio
- [ ] A data-integrity test asserts the 1.4.1 record has a restatement, a fail example, a pass example, a valid level, and a resolvable guideline number
- [ ] The card renders the criterion number in tabular monospace, the name, a level badge distinguished by shape and glyph as well as colour, and the fail/pass pair
- [ ] The page has a skip link as its first focusable element and a visible focus indicator on every interactive element
- [ ] CI runs the unit tests and an axe-core scan against the built page on every push and pull request
- [ ] The axe scan passes in both themes

## Blocked by

None - can start immediately.
