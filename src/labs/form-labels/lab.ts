import type { LabEntry } from '../shared/labEntry';
import { FormLabelsLab } from './FormLabelsLab';

export default {
  id: 'form-labels',
  title: 'Try it: label the field',
  criteria: ['3.3.2'],
  Lab: FormLabelsLab,
} satisfies LabEntry;
