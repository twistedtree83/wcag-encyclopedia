import { labCases, radio } from './support';

/** The orientation lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the orientation lab on 1.3.4',
    id: 'orientation',
    url: '/criteria/1.3.4/',
    lab: '.lab-slot .orient-lab',
    passing: '1.3.4 passes',
    failing: '1.3.4 fails',
    toFail: async (lab, page) => {
      await radio(lab, 'Adapts').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Portrait, 360 by 640 CSS pixels. Locked to portrait: the content is shown only this way up.',
  },
]);
