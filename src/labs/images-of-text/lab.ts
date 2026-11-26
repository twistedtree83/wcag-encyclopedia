import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { ImagesOfTextLab } from './ImagesOfTextLab';

export default {
  id: 'images-of-text',
  title: 'Try it: zoom and restyle the heading',
  criteria: ['1.4.5'],
  Lab: ImagesOfTextLab,
} satisfies LabEntry;
