import type { LabEntry } from '../shared/labEntry';
import { MultipleWaysLab } from './MultipleWaysLab';

export default {
  id: 'multiple-ways',
  title: 'Try it: find the buried page',
  criteria: ['2.4.5'],
  steps: {
    goal: 'Reach the VAT invoices page from Home.',
    controls:
      'The tick boxes under “This site offers” add or take away the menu, Search and A site ' +
      'map on the mock site. The buttons under “Reach VAT invoices from Home” try one way there ' +
      'and show the route it takes, page by page.',
    tryThis:
      'Untick Search and A site map to take those routes away. Then press Try the menu, Try ' +
      'search and Try the site map in turn.',
    result:
      'With two or more ways left, 2.4.5 passes: someone who can’t use one way has another. ' +
      'With only one way left, 2.4.5 fails, because people who can’t use that one way are ' +
      'stuck. The verdict line under the lab says which.',
  },
  Lab: MultipleWaysLab,
} satisfies LabEntry;
