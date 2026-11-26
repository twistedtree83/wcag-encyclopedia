import type { LabEntry } from '../shared/labEntry';
import { TooltipLab } from './TooltipLab';

export default {
  id: 'tame-tooltip',
  title: 'Try it: tame the tooltip',
  criteria: ['1.4.13'],
  Lab: TooltipLab,
} satisfies LabEntry;
