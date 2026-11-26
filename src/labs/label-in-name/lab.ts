import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { LabelInNameLab } from './LabelInNameLab';

export default {
  id: 'label-in-name',
  title: 'Try it: say what you see',
  criteria: ['2.5.3'],
  steps: {
    goal: 'Make a button answer to the words written on it.',
    controls:
      'The Visible text on the button field sets the words the button shows. The aria-label ' +
      'field sets a name that software uses instead; leave it empty for none. The Voice control ' +
      'log says what happens when you say “click” and the visible text, and the log beside it ' +
      'says what a screen reader hears.',
    tryThis:
      'The lab starts with “Send” on the button and an aria-label of “Submit form”, which ' +
      'fails. Empty the aria-label field, or change it to “Send form”. Then change the visible ' +
      'text to words the aria-label doesn’t contain.',
    result:
      '2.5.3 passes when the button’s name contains its visible words, in order. It fails when ' +
      'it doesn’t: someone using voice control says “click Send” and nothing happens. The ' +
      'verdict line under the lab says which.',
  },
  Lab: LabelInNameLab,
} satisfies LabEntry;
