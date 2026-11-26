import type { LabEntry } from '../shared/labEntry';
import { AccessibleAuthLab } from './AccessibleAuthLab';

export default {
  id: 'accessible-auth',
  title: 'Try it: sign in without a test',
  criteria: ['3.3.8'],
  Lab: AccessibleAuthLab,
} satisfies LabEntry;
