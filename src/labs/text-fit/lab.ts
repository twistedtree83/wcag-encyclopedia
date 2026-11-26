import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { ResizeTextLab, TextSpacingLab } from './TextFitLabs';

export default [
  {
    id: 'text-spacing',
    title: 'Try it: loosen the spacing',
    criteria: ['1.4.12'],
    flagshipFor: '1.4.12',
    Lab: TextSpacingLab,
  },
  {
    id: 'resize-text',
    title: 'Try it: text to 200%',
    criteria: ['1.4.4'],
    Lab: ResizeTextLab,
  },
] satisfies readonly LabEntry[];
