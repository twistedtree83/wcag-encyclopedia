import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { HeadingsLab } from './HeadingsLab';

export default {
  id: 'headings-labels',
  title: 'Try it: write the headings',
  criteria: ['2.4.6'],
  Lab: HeadingsLab,
} satisfies LabEntry;
