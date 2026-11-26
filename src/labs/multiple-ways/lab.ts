import type { LabEntry } from '../shared/labEntry';
import { MultipleWaysLab } from './MultipleWaysLab';

export default {
  id: 'multiple-ways',
  title: 'Try it: find the buried page',
  criteria: ['2.4.5'],
  Lab: MultipleWaysLab,
} satisfies LabEntry;
