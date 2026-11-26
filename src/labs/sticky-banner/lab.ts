import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { ObscuredLab } from './ObscuredLab';

export default {
  id: 'sticky-banner',
  title: 'Try it: move the sticky banner',
  criteria: ['2.4.11'],
  steps: {
    goal: 'Keep a sticky banner from hiding the field that has focus.',
    controls:
      'The Banner position slider moves the banner down the mock window, from the top to 160 ' +
      'pixels down. The Banner height slider makes it taller or shorter. The readout under ' +
      '“The focused field” says how much of the field the banner covers.',
    tryThis:
      'Drag Banner position to 70 pixels, so the banner sits over the field. Then drag Banner ' +
      'height below 40px, and back up to 40px or more.',
    result:
      '2.4.11 passes while any of the focused field is in view, even when part of it is hidden. ' +
      'It fails when the banner hides the field completely, because keyboard users can’t see ' +
      'where focus has gone. The verdict line under the lab says which.',
  },
  Lab: ObscuredLab,
} satisfies LabEntry;
