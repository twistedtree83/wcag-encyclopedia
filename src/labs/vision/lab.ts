import type { LabEntry } from '../shared/labEntry';
import { NonTextContrastLab, SensoryLab, UseOfColourLab } from './VisionLabs';

export default [
  {
    id: 'use-of-colour',
    title: 'Try it: take the colour away',
    criteria: ['1.4.1'],
    Lab: UseOfColourLab,
  },
  {
    id: 'non-text-contrast',
    title: 'Try it: fade the edges',
    criteria: ['1.4.11'],
    Lab: NonTextContrastLab,
  },
  {
    id: 'sensory-instruction',
    title: 'Try it: rewrite the instruction',
    criteria: ['1.3.3'],
    Lab: SensoryLab,
  },
] satisfies readonly LabEntry[];
