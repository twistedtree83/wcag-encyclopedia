import type { LabEntry } from '../shared/labEntry';
import { ReflowLab } from './ReflowLab';

export default {
  id: 'reflow',
  title: 'Try it: zoom to 400%',
  criteria: ['1.4.10'],
  flagshipFor: '1.4.10',
  Lab: ReflowLab,
} satisfies LabEntry;
