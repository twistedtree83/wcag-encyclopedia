import { labCases, radio } from './support';

/** The meaningful-sequence lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the reorder-the-steps lab on 1.3.2',
    id: 'meaningful-sequence',
    url: '/criteria/1.3.2/',
    lab: '.lab-slot .seq-lab',
    passing: '1.3.2 passes',
    failing: '1.3.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Confirm, Basket, Address').focus();
      await page.keyboard.press('ArrowUp');
    },
    said: 'Screen reader reads: 1. Basket; 2. Address; 3. Confirm. In order.',
  },
]);
