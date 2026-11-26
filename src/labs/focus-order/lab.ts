import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { FocusOrderLab } from './FocusOrderLab';

export default {
  id: 'focus-order',
  title: 'Try it: break the focus order',
  criteria: ['2.4.3'],
  steps: {
    goal: 'Keep the order Tab moves through a form the same as the order it is seen in.',
    controls:
      'The options under “Source order: the markup” change the order of the form’s parts in ' +
      'the HTML, which the layout ignores. The options under “Positive tabindex” give ' +
      'tabindex="1" to Postcode or to Send. The numbers on the mock, and the “Tab visits” line, ' +
      'show where focus goes.',
    tryThis:
      'The lab starts in order. Pick Column by column, or Send button first, and watch the ' +
      'numbers. Then set the source order back to Row by row and give tabindex="1" to Postcode.',
    result:
      'When “Tab visits” matches “Seen on screen”, 2.4.3 passes. When it doesn’t, 2.4.3 ' +
      'fails: keyboard users and people using a screen magnifier jump about the form and lose ' +
      'their place. The verdict line under the lab says which.',
  },
  flagshipFor: '2.4.3',
  Lab: FocusOrderLab,
} satisfies LabEntry;
