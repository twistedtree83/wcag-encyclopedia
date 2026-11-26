import { labCases } from './support';

/** The skip-link lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the skip link lab on 2.4.1',
    url: '/criteria/2.4.1/',
    lab: '.lab-slot .bp-lab',
    passing: '2.4.1 passes',
    failing: '2.4.1 fails',
    toFail: async (lab, page) => {
      await lab.getByRole('checkbox', { name: 'Skip link, first on the page' }).focus();
      await page.keyboard.press('Space');
    },
    said: 'No skip link: 15 Tab presses to reach the article, on every page.',
  },
]);
