import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { AltTextLab } from './AltTextLab';

export default {
  id: 'alt-text',
  title: 'Try it: write the alt text',
  criteria: ['1.1.1'],
  flagshipFor: '1.1.1',
  Lab: AltTextLab,
} satisfies LabEntry;
