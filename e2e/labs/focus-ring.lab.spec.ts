import { labCases, axeStates } from './support';

/** The focus-ring lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the focus ring lab on 2.4.7',
    id: 'focus-ring',
    url: '/criteria/2.4.7/',
    lab: '.lab-slot .ring-lab',
    passing: '2.4.7 passes',
    failing: '2.4.7 fails',
    toFail: async (lab, page) => {
      await lab.getByRole('slider', { name: 'Gap from the button' }).focus();
      await page.keyboard.press('Home');
    },
    said:
      '3 pixel blue ring, touching the button. 6.70 to 1 against the page, 2.18 to 1 against the button. Lost against the button.',
  },
]);

/** The lab's URL states, scanned by axe in four modes. */
axeStates([
  '/criteria/2.4.7/?w=0&off=2&c=blue',
  '/criteria/2.4.7/?w=6&off=0&c=yellow',
  '/criteria/2.4.7/?w=1&off=6&c=grey',
]);
