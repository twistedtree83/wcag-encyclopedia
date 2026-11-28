import { labCases, axeStates } from './support';

/** The target-size lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the target size lab on 2.5.8',
    id: 'target-size',
    url: '/criteria/2.5.8/',
    lab: '.lab-slot .ts-lab',
    passing: '2.5.8 passes',
    failing: '2.5.8 fails',
    toFail: async (lab, page) => {
      await lab.getByRole('slider', { name: 'Space between targets' }).focus();
      await page.keyboard.press('Home');
    },
    said: '16 pixel targets, touching. Under 24 by 24, and their 24 pixel circles overlap by 8 pixels. Fails.',
  },
]);

/** The lab's URL states, scanned by axe in four modes. */
axeStates([
  '/criteria/2.5.8/?size=8&gap=0',
  '/criteria/2.5.8/?size=44&gap=8',
]);
