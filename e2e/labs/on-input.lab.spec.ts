import { labCases, radio } from './support';

/** The on-input lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the on-input lab on 3.2.2',
    url: '/criteria/3.2.2/',
    lab: '.lab-slot .olab',
    passing: '3.2.2 passes',
    failing: '3.2.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Goes to its page straight away').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Changing the country now waits for the Go button.',
  },
]);
