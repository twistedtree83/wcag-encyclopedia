import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { RedundantEntryLab } from './RedundantEntryLab';

export default {
  id: 'redundant-entry',
  title: 'Try it: check out without retyping',
  criteria: ['3.3.7'],
  Lab: RedundantEntryLab,
} satisfies LabEntry;
