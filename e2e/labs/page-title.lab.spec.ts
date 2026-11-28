import { labCases, radio } from './support';

/** The page-title lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the page title lab on 2.4.2',
    id: 'page-title',
    url: '/criteria/2.4.2/',
    lab: '.lab-slot .title-lab',
    passing: '2.4.2 passes',
    failing: '2.4.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Generic: “Acme”').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Screen reader says: Delivery details — Acme. The title says which page this is.',
  },
]);
