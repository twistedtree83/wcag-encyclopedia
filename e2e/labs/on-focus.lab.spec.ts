import { labCases, radio } from './support';

/** The on-focus lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the what-focus-does lab on 3.2.1',
    id: 'on-focus',
    url: '/criteria/3.2.1/',
    lab: '.lab-slot .focus-lab',
    passing: '3.2.1 passes',
    failing: '3.2.1 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Sends the form').focus();
      await page.keyboard.press('ArrowUp');
    },
    said: 'Focusing Email does nothing. Only Send sends.',
  },
]);
