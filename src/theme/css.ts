/**
 * Turns the palettes into CSS custom properties.
 *
 * Injected into `index.html` at build time by a Vite plugin, so there is no flash of an
 * unstyled or wrong-themed page and no runtime cost. `tokens.ts` stays the only place a
 * colour is written down.
 *
 * Theme resolution, in cascade order:
 *   1. `:root`                                    — light, the default
 *   2. `@media (prefers-color-scheme: dark)`      — dark, unless the reader chose light
 *   3. `:root[data-theme="dark"]`                 — dark, chosen explicitly
 * The media query is guarded with `:not([data-theme="light"])` so an explicit light choice
 * wins over a dark OS setting. T-04 wires the toggle that sets the attribute.
 */

import { light, dark, type Token } from './tokens';

function declarations(palette: Record<Token, string>, indent = '  '): string {
  return (Object.entries(palette) as [Token, string][])
    .map(([name, value]) => `${indent}--${name}: ${value};`)
    .join('\n');
}

export function tokensCss(): string {
  return [
    ':root {',
    declarations(light),
    '  color-scheme: light;',
    '}',
    '',
    '@media (prefers-color-scheme: dark) {',
    '  :root:not([data-theme="light"]) {',
    declarations(dark, '    '),
    '    color-scheme: dark;',
    '  }',
    '}',
    '',
    ':root[data-theme="dark"] {',
    declarations(dark),
    '  color-scheme: dark;',
    '}',
  ].join('\n');
}
