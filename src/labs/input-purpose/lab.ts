import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { InputPurposeLab } from './InputPurposeLab';

export default {
  id: 'input-purpose',
  title: 'Try it: tag the fields',
  criteria: ['1.3.5'],
  Lab: InputPurposeLab,
} satisfies LabEntry;
