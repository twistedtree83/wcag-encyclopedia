import type { LabEntry } from '../shared/labEntry';
import { KeyboardLab } from './KeyboardLab';

export default {
  id: 'keyboard-control',
  title: 'Try it: reach the button by keyboard',
  criteria: ['2.1.1'],
  steps: {
    goal: 'Add an item to the basket using only the keyboard.',
    controls:
      'The choices under “Build the control as” make Add to basket A click-only div, A div with ' +
      'tabindex="0" (a div made into a Tab stop) or A real button. Press Tab, Press Enter and ' +
      'Press Space try it with simulated keys. Beneath, the markup shows the code and the log ' +
      'shows what a screen reader calls it.',
    tryThis:
      'The lab starts with A click-only div, and fails. Press Tab, then Press Enter, and see ' +
      'that nothing is reached or added. Then choose A div with tabindex="0" and A real button ' +
      'in turn, and press the keys again.',
    result:
      'With A real button, 2.1.1 passes: Tab reaches it, and Enter and Space press it. With ' +
      'either div, 2.1.1 fails, because Tab skips it or no key presses it, so people who use a ' +
      'keyboard or a switch can’t add the item. The verdict line under the lab says which.',
  },
  Lab: KeyboardLab,
} satisfies LabEntry;
