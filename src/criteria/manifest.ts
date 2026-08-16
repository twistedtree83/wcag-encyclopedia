/**
 * The closed set: every Level A and AA success criterion in WCAG 2.2.
 *
 * Fifty-five entries — twenty Perceivable, twenty Operable, thirteen Understandable, two
 * Robust. WCAG 2.2 removed `4.1.1 Parsing`; its absence here is correct and deliberate.
 *
 * This is the corpus's contract. The data-integrity test asserts that every authored record
 * appears here with a matching level and guideline, so a typo'd criterion number or a
 * mislabelled level fails the gate rather than shipping. As content tasks land, the corpus
 * grows toward this list; when it matches, the encyclopedia is complete.
 *
 * AAA criteria are deliberately absent: they appear inline in the corpus only where they
 * change a common pattern, and are exempt from this manifest.
 */

import type { Level } from './types';

export type ManifestEntry = {
  readonly num: string;
  readonly name: string;
  readonly level: Level;
  readonly guideline: string;
};

const e = (num: string, name: string, level: Level): ManifestEntry => ({
  num,
  name,
  level,
  guideline: num.split('.').slice(0, 2).join('.'),
});

export const EXPECTED: readonly ManifestEntry[] = [
  // 1.1 Text Alternatives
  e('1.1.1', 'Non-text Content', 'A'),
  // 1.2 Time-based Media
  e('1.2.1', 'Audio-only and Video-only (Prerecorded)', 'A'),
  e('1.2.2', 'Captions (Prerecorded)', 'A'),
  e('1.2.3', 'Audio Description or Media Alternative (Prerecorded)', 'A'),
  e('1.2.4', 'Captions (Live)', 'AA'),
  e('1.2.5', 'Audio Description (Prerecorded)', 'AA'),
  // 1.3 Adaptable
  e('1.3.1', 'Info and Relationships', 'A'),
  e('1.3.2', 'Meaningful Sequence', 'A'),
  e('1.3.3', 'Sensory Characteristics', 'A'),
  e('1.3.4', 'Orientation', 'AA'),
  e('1.3.5', 'Identify Input Purpose', 'AA'),
  // 1.4 Distinguishable
  e('1.4.1', 'Use of Color', 'A'),
  e('1.4.2', 'Audio Control', 'A'),
  e('1.4.3', 'Contrast (Minimum)', 'AA'),
  e('1.4.4', 'Resize Text', 'AA'),
  e('1.4.5', 'Images of Text', 'AA'),
  e('1.4.10', 'Reflow', 'AA'),
  e('1.4.11', 'Non-text Contrast', 'AA'),
  e('1.4.12', 'Text Spacing', 'AA'),
  e('1.4.13', 'Content on Hover or Focus', 'AA'),
  // 2.1 Keyboard Accessible
  e('2.1.1', 'Keyboard', 'A'),
  e('2.1.2', 'No Keyboard Trap', 'A'),
  e('2.1.4', 'Character Key Shortcuts', 'A'),
  // 2.2 Enough Time
  e('2.2.1', 'Timing Adjustable', 'A'),
  e('2.2.2', 'Pause, Stop, Hide', 'A'),
  // 2.3 Seizures and Physical Reactions
  e('2.3.1', 'Three Flashes or Below Threshold', 'A'),
  // 2.4 Navigable
  e('2.4.1', 'Bypass Blocks', 'A'),
  e('2.4.2', 'Page Titled', 'A'),
  e('2.4.3', 'Focus Order', 'A'),
  e('2.4.4', 'Link Purpose (In Context)', 'A'),
  e('2.4.5', 'Multiple Ways', 'AA'),
  e('2.4.6', 'Headings and Labels', 'AA'),
  e('2.4.7', 'Focus Visible', 'AA'),
  e('2.4.11', 'Focus Not Obscured (Minimum)', 'AA'),
  // 2.5 Input Modalities
  e('2.5.1', 'Pointer Gestures', 'A'),
  e('2.5.2', 'Pointer Cancellation', 'A'),
  e('2.5.3', 'Label in Name', 'A'),
  e('2.5.4', 'Motion Actuation', 'A'),
  e('2.5.7', 'Dragging Movements', 'AA'),
  e('2.5.8', 'Target Size (Minimum)', 'AA'),
  // 3.1 Readable
  e('3.1.1', 'Language of Page', 'A'),
  e('3.1.2', 'Language of Parts', 'AA'),
  // 3.2 Predictable
  e('3.2.1', 'On Focus', 'A'),
  e('3.2.2', 'On Input', 'A'),
  e('3.2.3', 'Consistent Navigation', 'AA'),
  e('3.2.4', 'Consistent Identification', 'AA'),
  e('3.2.6', 'Consistent Help', 'A'),
  // 3.3 Input Assistance
  e('3.3.1', 'Error Identification', 'A'),
  e('3.3.2', 'Labels or Instructions', 'A'),
  e('3.3.3', 'Error Suggestion', 'AA'),
  e('3.3.4', 'Error Prevention (Legal, Financial, Data)', 'AA'),
  e('3.3.7', 'Redundant Entry', 'A'),
  e('3.3.8', 'Accessible Authentication (Minimum)', 'AA'),
  // 4.1 Compatible — 4.1.1 Parsing was removed in WCAG 2.2.
  e('4.1.2', 'Name, Role, Value', 'A'),
  e('4.1.3', 'Status Messages', 'AA'),
];

export const EXPECTED_TOTAL = 55;

export function expectedFor(num: string): ManifestEntry | undefined {
  return EXPECTED.find((entry) => entry.num === num);
}
