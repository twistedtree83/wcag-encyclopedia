/**
 * The conformance level badge.
 *
 * Differs in shape, glyph, and label — not hue alone. A is a filled square, AA an outlined
 * pill, AAA a double-ruled pill. Remove all colour and the three are still distinguishable,
 * which is the site obeying 1.4.1 while documenting it.
 */

import type { Level } from '../criteria/types';

const GLYPH: Record<Level, string> = { A: '■', AA: '◐', AAA: '◈' };

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span className={`level-badge level-badge--${level.toLowerCase()}`}>
      <span aria-hidden="true" className="level-badge__glyph">
        {GLYPH[level]}
      </span>
      Level {level}
    </span>
  );
}
