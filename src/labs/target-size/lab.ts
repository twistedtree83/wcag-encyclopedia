import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { TargetSizeLab } from './TargetSizeLab';

export default {
  id: 'target-size',
  title: 'Try it: size the targets',
  criteria: ['2.5.8'],
  flagshipFor: '2.5.8',
  Lab: TargetSizeLab,
} satisfies LabEntry;
