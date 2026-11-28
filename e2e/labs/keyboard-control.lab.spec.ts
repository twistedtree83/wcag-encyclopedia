import { labCases, radio } from './support';

/** The keyboard-control lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the reach-the-button lab on 2.1.1',
    id: 'keyboard-control',
    url: '/criteria/2.1.1/',
    lab: '.lab-slot .kb-lab',
    passing: '2.1.1 passes',
    failing: '2.1.1 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'A click-only div').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
    },
    said: 'A real button. Tab reaches it, and Enter and Space press it.',
  },
]);
