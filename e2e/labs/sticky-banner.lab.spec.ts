import { labCases } from './support';

/** The sticky-banner lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the sticky banner lab on 2.4.11',
    id: 'sticky-banner',
    url: '/criteria/2.4.11/',
    lab: '.lab-slot .nob-lab',
    passing: '2.4.11 passes',
    failing: '2.4.11 fails',
    toFail: async (lab, page) => {
      await lab.getByRole('slider', { name: 'Banner height' }).focus();
      await page.keyboard.press('End');
    },
    said: 'Banner 160 pixels tall, at the top. The focused field is completely hidden.',
  },
]);
