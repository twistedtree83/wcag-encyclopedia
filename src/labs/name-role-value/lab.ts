import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { NameRoleValueLab } from './NameRoleValueLab';

export default {
  id: 'name-role-value',
  title: 'Try it: build the toggle',
  criteria: ['4.1.2'],
  flagshipFor: '4.1.2',
  Lab: NameRoleValueLab,
} satisfies LabEntry;
