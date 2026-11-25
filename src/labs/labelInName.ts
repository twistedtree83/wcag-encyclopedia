/**
 * Label in Name (#49): voice-control matching, and the 2.5.3 lab's model.
 *
 * A voice-control user says what they see: "click Send". The software clicks the control whose
 * accessible name contains those words, whole and in order, ignoring case and punctuation. If
 * an aria-label replaced the visible text with other words, nothing matches.
 */

import type { Verdict } from './LabShell';

const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

/** Whether saying `phrase` reaches a control named `name`. */
export function voiceMatches(phrase: string, name: string): boolean {
  const said = words(phrase);
  const named = words(name);
  if (said.length === 0) return false;
  for (let i = 0; i + said.length <= named.length; i++) {
    if (said.every((w, j) => named[i + j] === w)) return true;
  }
  return false;
}

/** The lab's button: its visible text and its aria-label ('' for none). */
export type Lin = { readonly visible: string; readonly ariaLabel: string };

export const LIN_START: Lin = { visible: 'Send', ariaLabel: 'Submit form' };

/** The button's accessible name: a non-empty aria-label wins over its content. */
export function linName({ visible, ariaLabel }: Lin): string {
  return ariaLabel.trim() || visible.trim();
}

export function linVerdict(lin: Lin): Verdict {
  return { criterion: '2.5.3', passes: voiceMatches(lin.visible, linName(lin)) };
}

/** The live region's sentence after a change: what "click <visible text>" did. */
export function linSaid(lin: Lin): string {
  const visible = lin.visible.trim();
  if (!visible) return 'The button shows no text, so there is nothing to say.';
  const said = `You said “click ${visible}”.`;
  return voiceMatches(visible, linName(lin))
    ? `${said} It clicked “${linName(lin)}”.`
    : `${said} Nothing happened: the button’s name is “${linName(lin)}”.`;
}
