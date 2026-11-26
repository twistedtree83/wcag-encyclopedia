import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { PageTitleLab } from './PageTitleLab';

export default {
  id: 'page-title',
  title: 'Try it: title the page',
  criteria: ['2.4.2'],
  Lab: PageTitleLab,
} satisfies LabEntry;
