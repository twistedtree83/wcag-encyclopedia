import type { LabEntry } from '../shared/labEntry';
import { StatusLab } from './StatusLab';

export default {
  id: 'status-message',
  title: 'Try it: announce the basket',
  criteria: ['4.1.3'],
  Lab: StatusLab,
} satisfies LabEntry;
