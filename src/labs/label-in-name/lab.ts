import type { LabEntry } from '../shared/labEntry';
import { LabelInNameLab } from './LabelInNameLab';

export default {
  id: 'label-in-name',
  title: 'Try it: say what you see',
  criteria: ['2.5.3'],
  Lab: LabelInNameLab,
} satisfies LabEntry;
