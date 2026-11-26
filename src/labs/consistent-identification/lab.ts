import type { LabEntry } from '../shared/labEntry';
import { ConsistentIdLab } from './ConsistentIdLab';

export default {
  id: 'consistent-identification',
  title: 'Try it: name the search button',
  criteria: ['3.2.4'],
  Lab: ConsistentIdLab,
} satisfies LabEntry;
