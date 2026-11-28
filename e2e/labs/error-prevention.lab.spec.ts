import { labCases, radio } from './support';

/** The error-prevention lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the error prevention lab on 3.3.4',
    id: 'error-prevention',
    url: '/criteria/3.3.4/',
    lab: '.lab-slot .plab',
    passing: '3.3.4 passes',
    failing: '3.3.4 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'None: one click pays').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Paying now shows a review step first, with a way back to correct it.',
  },
]);
