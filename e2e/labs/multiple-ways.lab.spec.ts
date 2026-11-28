import { labCases } from './support';

/** The multiple-ways lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the find-the-buried-page lab on 2.4.5',
    id: 'multiple-ways',
    url: '/criteria/2.4.5/',
    lab: '.lab-slot .ways-lab',
    passing: '2.4.5 passes',
    failing: '2.4.5 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await lab.getByRole('checkbox', { name: 'Search' }).focus();
      await page.keyboard.press('Space');
    },
    said: '2 ways lead to VAT invoices: the menu and search.',
  },
]);
