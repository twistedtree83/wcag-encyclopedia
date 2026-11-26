import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { TargetSizeLab } from './TargetSizeLab';

export default {
  id: 'target-size',
  title: 'Try it: size the targets',
  criteria: ['2.5.8'],
  steps: {
    goal: 'Size three icon targets so each can be tapped without hitting its neighbour.',
    controls:
      'The Target size slider sets each target’s width and height, from 8 by 8px to 44 by ' +
      '44px. The Space between targets slider sets the gap, from touching to 24px. Under 24 by ' +
      '24px, each target is drawn with a 24px circle round its centre.',
    tryThis:
      'The lab starts at 16 by 16px, 8px apart, with the circles just touching. Drag Space ' +
      'between targets down to 7px, then drag Target size up to 24 by 24px.',
    result:
      '2.5.8 passes when each target is at least 24 by 24px, or when smaller targets’ 24px ' +
      'circles don’t overlap. It fails when they overlap, because people with tremors or large ' +
      'fingers hit the wrong target. The verdict line under the lab says which.',
  },
  flagshipFor: '2.5.8',
  Lab: TargetSizeLab,
} satisfies LabEntry;
