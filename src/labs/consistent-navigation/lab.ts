import type { LabEntry } from '../shared/labEntry';
import { ConsistentNavLab } from './ConsistentNavLab';

export default {
  id: 'consistent-navigation',
  title: 'Try it: shuffle the menu',
  criteria: ['3.2.3'],
  steps: {
    goal: 'Keep the shop’s menu in the same order on every page.',
    controls:
      'The options under “Show the page” move the mock shop between Home, Products, Support and ' +
      'Account. The options under “The menu” keep it in the Same order on every page or ' +
      'Shuffled on each page. The Support adds “Contact us” tick box adds a link to the menu on ' +
      'Support only.',
    tryThis:
      'The lab starts with the menu shuffled. Visit each page and read the menu. Then choose ' +
      'Same order on every page, tick Support adds “Contact us” and visit Support again.',
    result:
      'When every page keeps Home’s order, 3.2.3 passes, even with “Contact us” added on Support. ' +
      'When the order shuffles, 3.2.3 fails, because people who learn where a link is, or who ' +
      'can’t see the whole menu at once, can’t find it again. The verdict line under the lab says ' +
      'which.',
  },
  Lab: ConsistentNavLab,
} satisfies LabEntry;
