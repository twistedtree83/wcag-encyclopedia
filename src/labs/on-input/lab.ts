import type { LabEntry } from '../shared/labEntry';
import { OnInputLab } from './OnInputLab';

export default {
  id: 'on-input',
  title: 'Try it: change the country',
  criteria: ['3.2.2'],
  Lab: OnInputLab,
} satisfies LabEntry;
