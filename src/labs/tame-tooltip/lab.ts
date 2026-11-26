import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { TooltipLab } from './TooltipLab';

export default {
  id: 'tame-tooltip',
  title: 'Try it: tame the tooltip',
  criteria: ['1.4.13'],
  steps: {
    goal:
      'Read the tooltip on the words “incl. duties” without it vanishing or getting in the way.',
    controls:
      'The tick boxes under “The tooltip” give it three behaviours: Escape closes it, The ' +
      'pointer can move into it, and It stays until dismissed. The buttons under “Try to read ' +
      'it” work it with a drawn pointer and keys: Hover the words, Move into the tooltip, Wait ' +
      'five seconds and Press Escape.',
    tryThis:
      'The lab starts with all three unticked, and fails. Press Hover the words, then Move into ' +
      'the tooltip, Wait five seconds or Press Escape, and see what each does. Then tick all ' +
      'three and try again.',
    result:
      'With all three ticked, 1.4.13 passes. With any one missing, 1.4.13 fails: someone zoomed ' +
      'in can’t move over to read it, someone who reads slowly loses it to a timer, and someone ' +
      'it covers can’t clear it. The verdict line under the lab says which.',
  },
  Lab: TooltipLab,
} satisfies LabEntry;
