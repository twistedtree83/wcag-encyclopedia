import { labCases, radio } from './support';

/** The consistent-navigation lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the shuffle-the-menu lab on 3.2.3',
    url: '/criteria/3.2.3/',
    lab: '.lab-slot .nav-lab',
    passing: '3.2.3 passes',
    failing: '3.2.3 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Shuffled on each page').focus();
      await page.keyboard.press('ArrowUp');
    },
    said:
      'The menu keeps one order on every page. On Home it reads Home, Products, Support, Account.',
  },
]);
