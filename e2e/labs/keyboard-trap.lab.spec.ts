import { labCases, radio } from './support';

/** The keyboard-trap lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the focus trap lab on 2.1.2',
    url: '/criteria/2.1.2/',
    lab: '.lab-slot .trap-lab',
    passing: '2.1.2 passes',
    failing: '2.1.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Trap focus, no way out').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Traps focus, and Escape lets it out.',
  },
]);
