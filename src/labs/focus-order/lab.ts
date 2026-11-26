import type { LabEntry } from '../shared/labEntry';
import { FocusOrderLab } from './FocusOrderLab';

export default {
  id: 'focus-order',
  title: 'Try it: break the focus order',
  criteria: ['2.4.3'],
  flagshipFor: '2.4.3',
  Lab: FocusOrderLab,
} satisfies LabEntry;
