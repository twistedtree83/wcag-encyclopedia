/**
 * The 2.3.1 lab's model (#62): how often a mock banner is set to flash. The page never flashes,
 * in any state: the banner is depicted as one second of still frames, and the flash-rate meter
 * draws the rate against the limit. 2.3.1 passes at no more than 3 flashes in any one second.
 * (The small-area and low-contrast allowances are left to the restatement.)
 */

import type { Verdict } from './LabShell';

export type FlashRate = 1 | 2 | 3 | 4 | 8;

export const RATES: readonly FlashRate[] = [1, 2, 3, 4, 8];
export const FLASH_LIMIT = 3;
export const FLASH_START: FlashRate = 2;

/** The meter's scale runs from 0 to FLASH_SCALE flashes a second. */
export const FLASH_SCALE = 8;

export const flashLabel = (r: number) => `${r} ${r === 1 ? 'flash' : 'flashes'} a second`;

export const RATE_OPTIONS = RATES.map((r) => ({
  value: String(r) as `${FlashRate}`,
  label: flashLabel(r),
}));

/** One second as 16 still frames: `true` where the banner is dark, one dark frame per flash. */
export function flashFrames(rate: number): boolean[] {
  const dark = new Set(Array.from({ length: rate }, (_, i) => Math.floor((i * 16) / rate)));
  return Array.from({ length: 16 }, (_, i) => dark.has(i));
}

export function flashVerdict(rate: number): Verdict {
  return { criterion: '2.3.1', passes: rate <= FLASH_LIMIT };
}

export function flashSaid(rate: number): string {
  const why = flashVerdict(rate).passes
    ? `Passes: no more than ${FLASH_LIMIT} a second`
    : `Fails: over the limit of ${FLASH_LIMIT} a second`;
  return `${flashLabel(rate)}. ${why}.`;
}
