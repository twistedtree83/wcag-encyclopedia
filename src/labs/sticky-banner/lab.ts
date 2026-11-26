import type { LabEntry } from '../shared/labEntry';
import { ObscuredLab } from './ObscuredLab';

export default {
  id: 'sticky-banner',
  title: 'Try it: move the sticky banner',
  criteria: ['2.4.11'],
  Lab: ObscuredLab,
} satisfies LabEntry;
