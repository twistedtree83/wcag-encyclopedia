import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { OnInputLab } from './OnInputLab';

export default {
  id: 'on-input',
  title: 'Try it: change the country',
  criteria: ['3.2.2'],
  steps: {
    goal: 'Change the country in a checkout form without losing the name already typed.',
    controls:
      'The options under “When the country changes, the page” set whether the mock checkout ' +
      'Goes to its page straight away or Waits for the Go button. The options under “Choose the ' +
      'country” change the country, and Press Go appears when the page waits for it.',
    tryThis:
      'The lab starts on Goes to its page straight away. Choose France and see the page change ' +
      'and the name vanish. Then choose Waits for the Go button, change the country and press ' +
      'Press Go.',
    result:
      'With Waits for the Go button, 3.2.2 passes: nothing changes until you ask for it. With ' +
      'Goes to its page straight away, 3.2.2 fails, because choosing an option moves people to ' +
      'a new page they didn’t expect and loses what they typed. The verdict line under the lab ' +
      'says which.',
  },
  Lab: OnInputLab,
} satisfies LabEntry;
