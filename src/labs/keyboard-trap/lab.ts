import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { KeyboardTrapLab } from './KeyboardTrapLab';

export default {
  id: 'keyboard-trap',
  title: 'Try it: trap the focus, or let it go',
  criteria: ['2.1.2'],
  steps: {
    goal: 'Tab into a newsletter sign-up box, then back out to the rest of the page.',
    controls:
      'The choices under “The widget” set it to “Trap focus, no way out”, “Trap focus, Escape ' +
      'lets it out” or “No trap: Tab moves on”. Press Tab and Press Escape move a drawn focus ' +
      'ring, and Take focus out of the widget always brings it back. Only the drawing is ever ' +
      'trapped: your own focus moves as usual.',
    tryThis:
      'The lab starts with “Trap focus, no way out”, and fails. Press Tab a few times and watch ' +
      'focus loop between Email and Subscribe, then Press Escape. Then choose the other two ' +
      'settings and try again.',
    result:
      'If Tab moves on, or Escape lets focus out, 2.1.2 passes. If focus loops with no way out, ' +
      '2.1.2 fails: people who use only a keyboard are stuck in the widget and can’t reach the ' +
      'rest of the page. The verdict line under the lab says which.',
  },
  Lab: KeyboardTrapLab,
} satisfies LabEntry;
