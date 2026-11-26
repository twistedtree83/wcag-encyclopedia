import type { LabEntry } from '../shared/labEntry';
import { PageLanguageLab, PartsLanguageLab } from './LanguageLabs';

export default [
  {
    id: 'page-language',
    title: 'Try it: declare the page’s language',
    criteria: ['3.1.1'],
    Lab: PageLanguageLab,
  },
  {
    id: 'parts-language',
    title: 'Try it: mark the French phrase',
    criteria: ['3.1.2'],
    Lab: PartsLanguageLab,
  },
] satisfies readonly LabEntry[];
