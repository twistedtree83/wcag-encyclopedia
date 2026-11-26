import type { ReactNode } from 'react';

/**
 * The reader's own colours and font (a user stylesheet), on whatever is inside. They reach text
 * through CSS (`.reader-colours--on`, swatch.css); nothing reaches the pixels of a picture.
 * Shared by the 1.4.5 live stages and the 1.4.5 lab.
 */
export function ReaderColours({ on, children }: { on: boolean; children: ReactNode }) {
  return <div className={on ? 'reader-colours reader-colours--on' : 'reader-colours'}>{children}</div>;
}
