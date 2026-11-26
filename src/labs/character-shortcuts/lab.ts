import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { ShortcutLab } from './ShortcutLab';

export default {
  id: 'character-shortcuts',
  title: 'Try it: dictate past a shortcut',
  criteria: ['2.1.4'],
  steps: {
    goal: 'Dictate a reply by voice in a mail client where the letter e archives the message.',
    controls:
      'The choices under “The archive shortcut” set it to “e, always on”, “Remapped to Alt+E” or ' +
      '“e, only while the message has focus”. Dictate “see you there” speaks the phrase into the ' +
      'Reply box, and speech input arrives as key presses. The binding shows the code for the ' +
      'shortcut.',
    tryThis:
      'The lab starts with “e, always on”, and fails. Press Dictate “see you there” and watch ' +
      'every e go missing from the reply as the message is archived. Then choose either of the ' +
      'other settings and dictate again.',
    result:
      'If the shortcut is remapped to use a key such as Alt, or works only while the message has ' +
      'focus, 2.1.4 passes. If a single letter is on everywhere, 2.1.4 fails: speech input users ' +
      'set it off with ordinary words, and so do people who press keys by mistake. The verdict ' +
      'line under the lab says which.',
  },
  Lab: ShortcutLab,
} satisfies LabEntry;
