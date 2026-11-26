import type { LabEntry } from '../shared/labEntry';
import { ErrorPreventionLab } from './ErrorPreventionLab';

export default {
  id: 'error-prevention',
  title: 'Try it: catch the wrong payment',
  criteria: ['3.3.4'],
  Lab: ErrorPreventionLab,
} satisfies LabEntry;
