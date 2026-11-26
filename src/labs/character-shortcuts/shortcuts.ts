/**
 * The 2.1.4 lab's model (#45): a mail client where "e" archives the open message. The shortcut
 * is bound to the bare key everywhere ("always"), remapped by the user to Alt+E, or active only
 * while the message has focus. A speech-input user dictates `WORD` into the reply box; speech
 * arrives as key presses, so an always-on single-key shortcut eats every "e".
 */

import type { Verdict } from '../shared/LabShell';

export type ScMode = 'always' | 'remapped' | 'focus';

export const SC_MODES: readonly { readonly value: ScMode; readonly label: string }[] = [
  { value: 'always', label: 'e, always on' },
  { value: 'remapped', label: 'Remapped to Alt+E' },
  { value: 'focus', label: 'e, only while the message has focus' },
];

/** The binding, as the lab's code readout shows it. */
export const BINDING: Readonly<Record<ScMode, string>> = {
  always: "document.onkeydown: key === 'e' → archive()",
  remapped: "document.onkeydown: altKey && key === 'e' → archive()",
  focus: "message.onkeydown: key === 'e' → archive()",
};

/** What the speech-input user dictates into the reply box. */
export const WORD = 'see you there';

export function scVerdict(mode: ScMode): Verdict {
  return { criterion: '2.1.4', passes: mode !== 'always' };
}

/** What lands in the reply box, and how many times the shortcut fired. */
export function scDictate(mode: ScMode, word: string): { typed: string; fired: number } {
  if (mode !== 'always') return { typed: word, fired: 0 };
  const chars = [...word];
  return {
    typed: chars.filter((c) => c !== 'e').join(''),
    fired: chars.filter((c) => c === 'e').length,
  };
}

/** The live region's sentence after the reader dictates the word. */
export function scTypedSaid(mode: ScMode): string {
  const { typed, fired } = scDictate(mode, WORD);
  const said = `Dictated “${WORD}”.`;
  return fired > 0
    ? `${said} The reply box got “${typed}”, and e archived the message.`
    : `${said} The reply box got all of it. No shortcut fired.`;
}

/** The live region's sentence after the reader changes the binding. */
export function scSaid(mode: ScMode): string {
  if (mode === 'always') return 'Shortcut e, always on.';
  if (mode === 'remapped') return 'Shortcut remapped to Alt+E.';
  return 'Shortcut e, only while the message has focus.';
}
