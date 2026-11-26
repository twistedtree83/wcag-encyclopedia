import { labCases, radio } from './support';

/** The consistent-help lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the move-the-help-link lab on 3.2.6',
    url: '/criteria/3.2.6/',
    lab: '.lab-slot .help-lab',
    passing: '3.2.6 passes',
    failing: '3.2.6 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      // Home has help in the header; Products moves it there, and Account drops it.
      await radio(lab, 'Home').focus();
      await page.keyboard.press('ArrowDown');
      await radio(lab, 'In the header').focus();
      await page.keyboard.press('Space');
      await radio(lab, 'Products').focus();
      await page.keyboard.press('ArrowDown');
      await radio(lab, 'Not on this page').focus();
      await page.keyboard.press('Space');
    },
    said: 'Every page with help has it in the header. Account has no help link.',
  },
]);
