import { labCases, radio } from './support';

/** The images-of-text lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the images of text lab on 1.4.5',
    id: 'images-of-text',
    url: '/criteria/1.4.5/',
    lab: '.lab-slot .itext-lab',
    passing: '1.4.5 passes',
    failing: '1.4.5 fails',
    toFail: async (lab, page) => {
      await radio(lab, 'Real text').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Image of text at 100%. Image at its own size: sharp. Your colours: off.',
  },
]);
