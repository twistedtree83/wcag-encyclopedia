import type { LabEntry } from '../shared/labEntry';
import { ColourCheckLab } from './ColourCheck';

export default {
  id: 'colour-check',
  title: 'Try it: check your own colours',
  criteria: ['1.4.1', '1.4.3', '1.4.11'],
  flagshipFor: '1.4.3',
  Lab: ColourCheckLab,
} satisfies LabEntry;
