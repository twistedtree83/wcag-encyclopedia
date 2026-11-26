import { labCases, axeStates, radio } from './support';

/** The alt-text lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the alt text lab on 1.1.1',
    url: '/criteria/1.1.1/',
    lab: '.lab-slot .alt-lab',
    passing: '1.1.1 passes',
    failing: '1.1.1 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Leave it out').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
    },
    said: 'Screen reader says: Wool overshirt in rust, worn open, image. The photo is named.',
  },
]);

/** The lab's URL states, scanned by axe in four modes. */
axeStates([
  '/criteria/1.1.1/?img=photo&alt=',
  '/criteria/1.1.1/?img=divider&alt=swirl-divider.svg',
]);
