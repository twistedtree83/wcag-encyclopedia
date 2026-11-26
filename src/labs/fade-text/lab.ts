import type { LabEntry } from '../shared/labEntry';
import { FadeLab } from './FadeLab';

export default {
  id: 'fade-text',
  title: 'Try it: fade the text',
  criteria: ['1.4.3'],
  Lab: FadeLab,
} satisfies LabEntry;
