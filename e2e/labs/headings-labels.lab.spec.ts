import { labCases, radio } from './support';

/** The headings-labels lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the headings and labels lab on 2.4.6',
    id: 'headings-labels',
    url: '/criteria/2.4.6/',
    lab: '.lab-slot .headings-lab',
    passing: '2.4.6 passes',
    failing: '2.4.6 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, '“More”, “Information”, “Details”').focus();
      await page.keyboard.press('ArrowDown');
      await radio(lab, '“Enter your details here”').focus();
      await page.keyboard.press('ArrowDown');
    },
    said:
      'Headings and fields list says: Returns and refunds, heading, level 4; How long you have, ' +
      'heading, level 5; What it costs, heading, level 5; Order number, edit text. ' +
      'Every heading and the label say what they are for.',
  },
]);
