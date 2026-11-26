import type { LabEntry } from '../shared/labEntry';
import { LinkPurposeLab } from './LinkPurposeLab';

export default {
  id: 'link-purpose',
  title: 'Try it: name the links',
  criteria: ['2.4.4'],
  Lab: LinkPurposeLab,
} satisfies LabEntry;
