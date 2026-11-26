import type { LabEntry } from '../shared/labEntry';
import { ConsistentNavLab } from './ConsistentNavLab';

export default {
  id: 'consistent-navigation',
  title: 'Try it: shuffle the menu',
  criteria: ['3.2.3'],
  Lab: ConsistentNavLab,
} satisfies LabEntry;
