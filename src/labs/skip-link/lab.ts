import type { LabEntry } from '../shared/labEntry';
import { BypassLab } from './BypassLab';

export default {
  id: 'skip-link',
  title: 'Try it: count the Tab presses',
  criteria: ['2.4.1'],
  Lab: BypassLab,
} satisfies LabEntry;
