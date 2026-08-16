/**
 * A measured contrast ratio, computed from the colours the example actually renders.
 *
 * The number is never typed by hand. It is read from the live palette for the current theme
 * and put through the contrast engine, so changing a swatch changes the badge with no content
 * edit — and the page can never display a ratio it does not actually measure. A page that
 * claims "7.4:1" next to a colour pair it never measured is exactly the credibility failure
 * this project exists to argue against.
 *
 * The badge states pass or fail with a glyph and a shape as well as colour, so it does not
 * lean on hue any more than the rest of the page does.
 */

import { contrastRatio, formatRatio, meetsAA, requiredRatio, type TextKind } from '../color/contrast';
import { palettes, type Token } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export function MeasuredRatio({
  fg,
  bg,
  kind,
  label,
}: {
  fg: Token;
  bg: Token;
  kind: TextKind;
  /** What was measured, e.g. "border" — omitted when the subject is obvious. */
  label?: string;
}) {
  const { theme } = useTheme();
  const palette = palettes[theme];
  const ratio = contrastRatio(palette[fg], palette[bg]);
  const passes = meetsAA(ratio, kind);

  return (
    <p className={`measured measured--${passes ? 'pass' : 'fail'}`}>
      <span aria-hidden="true" className="measured__glyph">
        {passes ? '✓' : '✕'}
      </span>
      <span className="visually-hidden">{passes ? 'Passes: ' : 'Fails: '}</span>
      {label ? `${label} ` : ''}
      {formatRatio(ratio)}
      <span className="measured__need">
        {passes ? 'meets' : 'needs'} {requiredRatio(kind)}:1
      </span>
    </p>
  );
}
