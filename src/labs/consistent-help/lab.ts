import type { LabEntry } from '../shared/labEntry';
import { ConsistentHelpLab } from './ConsistentHelpLab';

export default {
  id: 'consistent-help',
  title: 'Try it: move the help link',
  criteria: ['3.2.6'],
  Lab: ConsistentHelpLab,
} satisfies LabEntry;
