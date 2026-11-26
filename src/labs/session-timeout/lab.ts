import type { LabEntry } from '../shared/labEntry';
import { SessionLab } from './SessionLab';

export default {
  id: 'session-timeout',
  title: 'Try it: time out the session',
  criteria: ['2.2.1'],
  flagshipFor: '2.2.1',
  Lab: SessionLab,
} satisfies LabEntry;
