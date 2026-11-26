import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { KeyboardTrapLab } from './KeyboardTrapLab';

export default {
  id: 'keyboard-trap',
  title: 'Try it: trap the focus, or let it go',
  criteria: ['2.1.2'],
  Lab: KeyboardTrapLab,
} satisfies LabEntry;
