import { labCases } from './support';

/** The status-message lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the status message lab on 4.1.3',
    url: '/criteria/4.1.3/',
    lab: '.lab-slot .status-lab',
    passing: '4.1.3 passes',
    failing: '4.1.3 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await lab.getByRole('checkbox', { name: 'Put the message in a status region' }).focus();
      await page.keyboard.press('Space');
      await lab.getByRole('button', { name: 'Press Add to basket' }).focus();
      await page.keyboard.press('Enter');
    },
    said: 'Screen reader says: Added. 4 items in basket. Focus stayed on Add to basket.',
  },
]);
