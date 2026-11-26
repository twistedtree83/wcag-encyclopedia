import { labCases, radio } from './support';

/** The character-shortcuts lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the dictation lab on 2.1.4',
    url: '/criteria/2.1.4/',
    lab: '.lab-slot .sc-lab',
    passing: '2.1.4 passes',
    failing: '2.1.4 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'e, always on').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Shortcut remapped to Alt+E.',
  },
]);
