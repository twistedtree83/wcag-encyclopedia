import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { StatusLab } from './StatusLab';

export default {
  id: 'status-message',
  title: 'Try it: announce the basket',
  criteria: ['4.1.3'],
  steps: {
    goal: 'Let a screen reader user hear that an item went into the basket, without moving focus.',
    controls:
      'The Put the message in a status region, role="status" tick box makes the message the ' +
      'mock shop shows when an item is added a status region or plain text. The Press Add to basket button adds an ' +
      'item, and the log under “Screen reader announced” shows what was said.',
    tryThis:
      'The lab starts with the tick box clear. Press Add to basket and see that nothing is ' +
      'announced. Then tick Put the message in a status region, role="status" and press it again.',
    result:
      'With the message in a status region, 4.1.3 passes: the screen reader says it while focus ' +
      'stays on the button. As plain text, 4.1.3 fails, because the message changes on screen ' +
      'but screen reader users hear nothing and can’t tell the item was added. The verdict line ' +
      'under the lab says which.',
  },
  Lab: StatusLab,
} satisfies LabEntry;
