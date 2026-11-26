# Unit tests read rendered markup without a DOM

Vitest runs in Node (`environment: 'node'` in `vite.config.ts`). A DOM-shaped unit test renders React with `renderToStaticMarkup` and reads the result with `parseMarkup` from `tests/markup.ts`, a small reader for the well-formed HTML React writes, into the announcement log's `AxNode` shape. Anything that needs real layout, focus, events or computed style is tested in Playwright against the built pages, never in vitest.

## Considered options

- **A DOM library (happy-dom or jsdom) as the vitest environment.** Not adopted. Installing either as a devDependency works in this environment (happy-dom 21 installed and ran cleanly when this was written, then was removed), so the choice is open, not blocked. Neither does layout or real focus, so the tests that matter most would still be e2e, and a simulated DOM would invite unit tests that pass in Node and fail in a browser. The lab models are pure (`state → result`) by convention, and the markup reader covers the one place unit tests read rendered output.
- **Unit tests that query real elements through `fromDom`.** Rejected for the same reason: `fromDom` runs in the browser, where e2e already exercises it.

## Consequences

- About 15 test files use `renderToStaticMarkup`/`parseMarkup`. They stay as they are.
- `tests/markup.ts` is not a general HTML parser. It handles tags, quoted attributes, void elements and the entities React escapes. Extend it when React output needs more, rather than switching environment for one test.
- Revisit this only if a unit test genuinely needs DOM APIs (events, `querySelector`) that a pure model can't provide. Then add happy-dom per file (`// @vitest-environment happy-dom`), not globally.
