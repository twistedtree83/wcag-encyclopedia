/**
 * A measured contrast ratio, computed from the colours the example actually renders.
 *
 * The number is never typed by hand. It is read from each theme's palette and put through the
 * contrast engine, so changing a swatch changes the badge with no content edit, and the page
 * can never display a ratio it does not actually measure.
 *
 * Both themes' badges are rendered, each marked `data-theme-only`, and the token cascade hides
 * the inactive one (see `theme/css.ts`). So the right number shows before any script runs and
 * the server and client render identical markup.
 *
 * The badge states pass or fail with a glyph and a word as well as colour, so it does not
 * lean on hue any more than the rest of the page does. It reads as two sentences, what the
 * threshold needs and then what this example has: "Body text needs at least 4.5:1. This text
 * has 2.8:1."
 */

import { contrastRatio, formatRatio, meetsAA, requiredRatio, type TextKind } from '../color/contrast';
import { palettes, THEMES, type Token } from '../theme/tokens';

/** What each kind of threshold applies to, as the start of its sentence. */
function needs(kind: TextKind, label: string | undefined): string {
  if (kind === 'body') return 'Body text needs';
  if (kind === 'large') return 'Large text needs';
  return label === 'border' ? 'Borders need' : 'Borders and icons need';
}

export function MeasuredRatio({
  fg,
  bg,
  kind,
  label,
}: {
  fg: Token;
  bg: Token;
  kind: TextKind;
  /** What was measured, e.g. "border". Omitted when the subject is obvious. */
  label?: string;
}) {
  return (
    <>
      {THEMES.map((theme) => {
        const palette = palettes[theme];
        const ratio = contrastRatio(palette[fg], palette[bg]);
        const passes = meetsAA(ratio, kind);
        return (
          <p
            key={theme}
            data-theme-only={theme}
            className={`measured measured--${passes ? 'pass' : 'fail'}`}
          >
            <span aria-hidden="true" className="measured__glyph">
              {passes ? '✓' : '✕'}
            </span>
            <span className="visually-hidden">{passes ? 'Passes: ' : 'Fails: '}</span>
            <span className="measured__need">
              {`${needs(kind, label)} at least ${requiredRatio(kind)}:1.`}
            </span>
            {` This ${label ?? 'text'} has ${formatRatio(ratio)}.`}
          </p>
        );
      })}
    </>
  );
}
