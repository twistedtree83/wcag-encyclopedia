import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { SequenceLab } from './SequenceLab';

export default {
  id: 'meaningful-sequence',
  title: 'Try it: reorder the steps',
  criteria: ['1.3.2'],
  Lab: SequenceLab,
} satisfies LabEntry;
