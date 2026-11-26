/**
 * The 4.1.3 lab's model (#51): a mock shop's "added to basket" message, in a status region or
 * as plain text. A screen reader announces a status region's new text without focus moving;
 * plain text that changes is never said, so the reader who pressed Add hears nothing.
 *
 * What is announced is read from the mock's markup (`liveRegionLines`), never assumed here.
 */

import type { Verdict } from '../shared/LabShell';

/** The basket's count before the reader adds anything. */
export const BASKET_START = 3;

/** The button the message follows, where focus stays. */
export const ADD = 'Add to basket';

export function basketMessage(count: number): string {
  return `Added. ${count} items in basket.`;
}

export function statusVerdict(inRegion: boolean): Verdict {
  return { criterion: '4.1.3', passes: inRegion };
}

/** The live region's sentence after an add: what the screen reader announced, if anything. */
export function statusSaid(announced: readonly string[]): string {
  const stayed = `Focus stayed on ${ADD}.`;
  return announced.length
    ? `Screen reader says: ${announced.join(' ')} ${stayed}`
    : `Screen reader says nothing. ${stayed}`;
}

/** The live region's sentence after the reader moves the message in or out of a status region. */
export function toggleSaid(inRegion: boolean): string {
  return inRegion ? 'The message is in a status region now.' : 'The message is plain text now.';
}
