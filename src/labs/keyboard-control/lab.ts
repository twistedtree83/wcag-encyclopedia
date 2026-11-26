import type { LabEntry } from '../shared/labEntry';
import { KeyboardLab } from './KeyboardLab';

export default {
  id: 'keyboard-control',
  title: 'Try it: reach the button by keyboard',
  criteria: ['2.1.1'],
  Lab: KeyboardLab,
} satisfies LabEntry;
