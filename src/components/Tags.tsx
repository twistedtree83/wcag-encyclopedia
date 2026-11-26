import type { Level } from '../criteria/types';

/** A principle's shape marker. Decorative: the principle's name is always said in words too. */
export function Marker({ principle }: { principle: 1 | 2 | 3 | 4 }) {
  return <span className={`mk p${principle}`} aria-hidden="true" />;
}

/** The level badge: outline for A, solid for AA. "Level" is read but not shown. */
export function LevelTag({ level }: { level: Level }) {
  return (
    <span className={level === 'AA' ? 'lv aa' : 'lv'}>
      <span className="sr">Level </span>
      {level}
    </span>
  );
}

/** The sun pill on criteria introduced in WCAG 2.2. */
export function NewTag() {
  return <span className="new-tag">New in 2.2</span>;
}
