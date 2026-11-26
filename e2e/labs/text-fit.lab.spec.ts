import { labCases, axeStates, radio } from './support';

/** The text-fit lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the text spacing lab on 1.4.12',
    url: '/criteria/1.4.12/',
    lab: '.lab-slot .spacing-lab',
    passing: '1.4.12 passes',
    failing: '1.4.12 fails',
    toFail: async (lab, page) => {
      await lab.getByRole('checkbox', { name: 'Line height 1.5', exact: true }).focus();
      await page.keyboard.press('Space');
    },
    said: 'Line height 1.5. Fixed-height boxes: text is cut off.',
  },
  {
    name: 'the resize text lab on 1.4.4',
    url: '/criteria/1.4.4/',
    lab: '.lab-slot .resize-lab',
    passing: '1.4.4 passes',
    failing: '1.4.4 fails',
    toFail: async (lab, page) => {
      await radio(lab, '100%').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Text at 150%. Locked in px: text is cut off.',
  },
]);

/** The lab's URL states, scanned by axe in four modes. */
axeStates([
  '/criteria/1.4.12/?spacing=line,paragraph,letter,word&boxes=fixed',
  '/criteria/1.4.12/?spacing=line,paragraph,letter,word&boxes=flexible',
]);
