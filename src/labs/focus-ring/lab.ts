import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { FocusRingLab } from './FocusRingLab';

export default {
  id: 'focus-ring',
  title: 'Try it: style your own focus ring',
  criteria: ['2.4.7'],
  steps: {
    goal: 'Style a focus ring on a dark Save button so it can still be seen.',
    controls:
      'The Ring thickness slider sets how thick the ring is, from none to 6px. The Gap from the ' +
      'button slider sets the space between the button and the ring, from touching to 6px. The ' +
      'options under “Ring colour” pick Blue, Black, Mid grey or Yellow, and the results give ' +
      'the ring’s contrast against each colour it touches.',
    tryThis:
      'The lab starts with a blue ring 2px clear of the button. Drag Gap from the button to ' +
      'touching, then try Black and Yellow. Then drag Ring thickness to none.',
    result:
      '2.4.7 passes when the ring reaches 3 : 1 against everything it touches: the white page ' +
      'and, with no gap, the dark button too. It fails when the ring is lost against either, ' +
      'or there is no ring, because keyboard users can’t see where they are. The verdict line ' +
      'under the lab says which.',
  },
  flagshipFor: '2.4.7',
  Lab: FocusRingLab,
} satisfies LabEntry;
