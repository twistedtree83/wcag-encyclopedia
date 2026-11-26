import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { SequenceLab } from './SequenceLab';

export default {
  id: 'meaningful-sequence',
  title: 'Try it: reorder the steps',
  criteria: ['1.3.2'],
  steps: {
    goal:
      'Put the three checkout steps in an order that reads right, not just one that looks right.',
    controls:
      '“Source order: the markup” sets the order the steps are written in: Basket, Address, ' +
      'Confirm; Confirm, Basket, Address; or Address, Confirm, Basket. “CSS on the row” chooses ' +
      'None: boxes sit in source order, or order: sorts the boxes by number. On screen, left to ' +
      'right and Screen reader reads, in source order show the two orders.',
    tryThis:
      'The lab starts with Confirm first in the source and CSS order sorting the screen, so it ' +
      'looks right. Choose None: boxes sit in source order to see the real order. Then choose ' +
      'Basket, Address, Confirm under “Source order: the markup”.',
    result:
      '1.3.2 passes only when the source itself is in order, because screen readers and the ' +
      'keyboard follow the source, not the screen. CSS that makes a scrambled source look right ' +
      'still fails, and people using a screen reader hear Confirm before Basket. The verdict ' +
      'line under the lab says which.',
  },
  Lab: SequenceLab,
} satisfies LabEntry;
