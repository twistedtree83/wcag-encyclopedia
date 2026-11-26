import type { LabEntry } from '../shared/labEntry';
import { DescriptionLab, MediaAlternativeLab, MediaOnlyLab } from './MediaAltLabs';

export default [
  {
    id: 'media-only',
    title: 'Try it: give each clip its alternative',
    criteria: ['1.2.1'],
    Lab: MediaOnlyLab,
  },
  {
    id: 'media-alternative',
    title: 'Try it: carry what the camera shows',
    criteria: ['1.2.3'],
    Lab: MediaAlternativeLab,
  },
  {
    id: 'description',
    title: 'Try it: describe into the gaps',
    criteria: ['1.2.5'],
    Lab: DescriptionLab,
  },
] satisfies readonly LabEntry[];
