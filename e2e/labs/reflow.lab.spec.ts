import { labCases, axeStates, radio } from './support';

/** The reflow lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the reflow lab on 1.4.10',
    id: 'reflow',
    url: '/criteria/1.4.10/',
    lab: '.lab-slot .reflow-lab',
    passing: '1.4.10 passes',
    failing: '1.4.10 fails',
    toFail: async (lab, page) => {
      await radio(lab, '100%').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
    },
    said: '400% zoom, 320 CSS pixels wide. Fixed width: scrolls down and sideways.',
  },
]);

/** The lab's URL states, scanned by axe in four modes. */
axeStates([
  '/criteria/1.4.10/?zoom=400&layout=fixed',
  '/criteria/1.4.10/?zoom=400&layout=reflow',
]);
