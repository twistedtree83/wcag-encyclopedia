import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { FocusRingLab } from './FocusRingLab';

export default {
  id: 'focus-ring',
  title: 'Try it: style your own focus ring',
  criteria: ['2.4.7'],
  flagshipFor: '2.4.7',
  Lab: FocusRingLab,
} satisfies LabEntry;
