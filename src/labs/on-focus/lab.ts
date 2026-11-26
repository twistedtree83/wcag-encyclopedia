import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { OnFocusLab } from './OnFocusLab';

export default {
  id: 'on-focus',
  title: 'Try it: what focus does',
  criteria: ['3.2.1'],
  steps: {
    goal: 'Tab through a checkout form without anything happening that you didn’t ask for.',
    controls:
      'The options under “When Email gets focus” set what the Email field does when focus ' +
      'reaches it: Nothing, Sends the form or Opens another page. The Press Tab in the form ' +
      'button moves focus to the next stop in the mock form: Name, Email, then Send.',
    tryThis:
      'The lab starts on Sends the form. Press Tab in the form twice and watch the form go ' +
      'before Email is filled in. Then choose Nothing and press Tab in the form again.',
    result:
      'With Nothing, 3.2.1 passes: focus only moves, and only Send sends. With Sends the form or ' +
      'Opens another page, 3.2.1 fails, because keyboard and screen reader users are thrown out ' +
      'of the form just by moving through it. The verdict line under the lab says which.',
  },
  Lab: OnFocusLab,
} satisfies LabEntry;
