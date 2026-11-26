import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { StructureLab } from './StructureLab';

export default {
  id: 'structure',
  title: 'Try it: build the structure',
  criteria: ['1.3.1'],
  flagshipFor: '1.3.1',
  Lab: StructureLab,
} satisfies LabEntry;
