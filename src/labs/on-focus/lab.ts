import type { LabEntry } from '../shared/labEntry';
import { OnFocusLab } from './OnFocusLab';

export default {
  id: 'on-focus',
  title: 'Try it: what focus does',
  criteria: ['3.2.1'],
  Lab: OnFocusLab,
} satisfies LabEntry;
