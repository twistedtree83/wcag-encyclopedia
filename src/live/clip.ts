import { clips } from '../labs/shared/textFit';

/**
 * Whether a notice card's boxes (`data-box`, #54) cut off their text. Shared by the 1.4.4 and
 * 1.4.12 live stages and the notice card the labs draw.
 */

/** The boxes under `root` that the card sizes. */
export const boxesIn = (root: ParentNode) =>
  Array.from(root.querySelectorAll<HTMLElement>('[data-box]'));

/** Whether any box under `root` cuts off its text. */
export function clippedIn(root: ParentNode | null): boolean {
  return root ? boxesIn(root).some(clips) : false;
}
