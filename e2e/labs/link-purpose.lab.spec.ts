import { labCases, radio } from './support';

/** The link-purpose lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the link purpose lab on 2.4.4',
    url: '/criteria/2.4.4/',
    lab: '.lab-slot .link-lab',
    passing: '2.4.4 passes',
    failing: '2.4.4 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, '“Read more”').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
    },
    said:
      'Links list says: Read the annual report 2025, link; Read the board minutes for March, ' +
      'link; Read the sustainability update, link. Each link says where it goes, even out of context.',
  },
]);
