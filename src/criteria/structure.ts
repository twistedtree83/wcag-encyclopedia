/**
 * The four principles and thirteen guidelines.
 *
 * Structure is fixed by the standard, so it lives apart from the corpus, which grows.
 */

import type { Guideline, Principle } from './types';

export const PRINCIPLES: readonly Principle[] = [
  {
    num: 1,
    name: 'Perceivable',
    tagline: "If you can't perceive it, it isn't there for you.",
  },
  {
    num: 2,
    name: 'Operable',
    tagline: 'Every control has to be reachable by whatever you drive it with.',
  },
  {
    num: 3,
    name: 'Understandable',
    tagline: 'A thing you can perceive and operate can still be incomprehensible.',
  },
  {
    num: 4,
    name: 'Robust',
    tagline: "Assistive technology can only relay what the markup actually says.",
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

export function guidelineFor(num: string): Guideline | undefined {
  return GUIDELINES.find((g) => g.num === num);
}

export function principleFor(guidelineNum: string): Principle | undefined {
  const g = guidelineFor(guidelineNum);
  return g ? PRINCIPLES.find((p) => p.num === g.principle) : undefined;
}
