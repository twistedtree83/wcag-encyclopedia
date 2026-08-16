/**
 * The four principles and thirteen guidelines.
 *
 * Structure is fixed by the standard, so it lives apart from the corpus, which grows.
 * Each principle carries an accent hue *and* a marker shape — the grouping must survive
 * greyscale, so hue never carries it alone.
 */

import type { Guideline, Principle } from './types';

export type MarkerShape = 'square' | 'circle' | 'triangle' | 'diamond';

export const PRINCIPLES: readonly Principle[] = [
  {
    num: 1,
    name: 'Perceivable',
    tagline: "If you can't perceive it, it isn't there for you.",
    blurb:
      'Information and interface components must be presentable in ways every user can sense. ' +
      'Text that can be read aloud or enlarged; contrast that survives a bright room; structure ' +
      'that survives losing the layout.',
  },
  {
    num: 2,
    name: 'Operable',
    tagline: 'Every control has to be reachable by whatever you drive it with.',
    blurb:
      'Interface components and navigation must be operable by keyboard, by pointer, by voice, ' +
      'by switch. Nothing may trap you, rush you, or demand a gesture you cannot make.',
  },
  {
    num: 3,
    name: 'Understandable',
    tagline: 'A thing you can perceive and operate can still be incomprehensible.',
    blurb:
      'Information and the operation of the interface must be understandable. Readable language, ' +
      'predictable behaviour, and mistakes that are easy to notice, understand, and undo.',
  },
  {
    num: 4,
    name: 'Robust',
    tagline: "Assistive technology can only relay what the markup actually says.",
    blurb:
      'Content must be robust enough to be interpreted reliably by a wide variety of user ' +
      'agents, including assistive technologies — now and as they change.',
  },
];

export const GUIDELINES: readonly Guideline[] = [
  { num: '1.1', name: 'Text Alternatives', principle: 1 },
  { num: '1.2', name: 'Time-based Media', principle: 1 },
  { num: '1.3', name: 'Adaptable', principle: 1 },
  { num: '1.4', name: 'Distinguishable', principle: 1 },
  { num: '2.1', name: 'Keyboard Accessible', principle: 2 },
  { num: '2.2', name: 'Enough Time', principle: 2 },
  { num: '2.3', name: 'Seizures & Physical Reactions', principle: 2 },
  { num: '2.4', name: 'Navigable', principle: 2 },
  { num: '2.5', name: 'Input Modalities', principle: 2 },
  { num: '3.1', name: 'Readable', principle: 3 },
  { num: '3.2', name: 'Predictable', principle: 3 },
  { num: '3.3', name: 'Input Assistance', principle: 3 },
  { num: '4.1', name: 'Compatible', principle: 4 },
];

/** Accent token and marker shape per principle. Both carry the grouping; neither alone. */
export const PRINCIPLE_MARKS: Record<1 | 2 | 3 | 4, { token: string; shape: MarkerShape }> = {
  1: { token: 'p1', shape: 'square' },
  2: { token: 'p2', shape: 'circle' },
  3: { token: 'p3', shape: 'triangle' },
  4: { token: 'p4', shape: 'diamond' },
};

export function guidelineFor(num: string): Guideline | undefined {
  return GUIDELINES.find((g) => g.num === num);
}

export function principleFor(guidelineNum: string): Principle | undefined {
  const g = guidelineFor(guidelineNum);
  return g ? PRINCIPLES.find((p) => p.num === g.principle) : undefined;
}
