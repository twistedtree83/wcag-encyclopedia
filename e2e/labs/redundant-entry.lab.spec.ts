import { labCases, radio } from './support';

/** The redundant-entry lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the redundant entry lab on 3.3.7',
    id: 'redundant-entry',
    url: '/criteria/3.3.7/',
    lab: '.lab-slot .re-lab',
    passing: '3.3.7 passes',
    failing: '3.3.7 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Asked for again').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Step 1 of 3: Delivery address. At billing, the address is carried forward.',
  },
]);
