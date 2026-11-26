import type { LabEntry } from '../shared/labEntry';
import { FormErrorsLab } from './FormErrorsLab';

export default {
  id: 'form-errors',
  title: 'Try it: show the error',
  criteria: ['3.3.1'],
  Lab: FormErrorsLab,
} satisfies LabEntry;
