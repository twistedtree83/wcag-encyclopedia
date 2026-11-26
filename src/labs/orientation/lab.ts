import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { OrientationLab } from './OrientationLab';

export default {
  id: 'orientation',
  title: 'Try it: turn the phone',
  criteria: ['1.3.4'],
  Lab: OrientationLab,
} satisfies LabEntry;
