import { labCases, radio } from './support';

/** The vision lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the take-the-colour-away lab on 1.4.1',
    id: 'use-of-colour',
    url: '/criteria/1.4.1/',
    lab: '.lab-slot .vis-lab',
    passing: '1.4.1 passes',
    failing: '1.4.1 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      for (const cue of ['Underline the links', 'Mark the error with an icon']) {
        await lab.getByRole('checkbox', { name: cue }).focus();
        await page.keyboard.press('Space');
      }
    },
    said:
      'Full colour. The links: 1.58 : 1 against the text around them, and underlined. Stands out. ' +
      'The field in error: 1.34 : 1 against the field beside it, and marked with an icon. Stands out.',
  },
  {
    name: 'the fade-the-edges lab on 1.4.11',
    id: 'non-text-contrast',
    url: '/criteria/1.4.11/',
    lab: '.lab-slot .vis-lab',
    passing: '1.4.11 passes',
    failing: '1.4.11 fails',
    toFail: async (lab, page) => {
      await lab.getByRole('slider', { name: 'Fade the edges' }).focus();
      await page.keyboard.press('End');
    },
    said: '100% faded. The edges are 1.00 : 1 against the background, in full colour. Fails borders and icons AA.',
  },
  {
    name: 'the rewrite-the-instruction lab on 1.3.3',
    id: 'sensory-instruction',
    url: '/criteria/1.3.3/',
    lab: '.lab-slot .vis-lab',
    passing: '1.3.3 passes',
    failing: '1.3.3 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Press the round green button on the right.').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
    },
    said:
      'Read aloud: “Press Continue to payment.” The buttons are Save for later and Continue to ' +
      'payment. The instruction names Continue to payment.',
  },
]);
