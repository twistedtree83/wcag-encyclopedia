import { labCases } from './support';

/** The label-in-name lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the say-what-you-see lab on 2.5.3',
    id: 'label-in-name',
    url: '/criteria/2.5.3/',
    lab: '.lab-slot .lin-lab',
    passing: '2.5.3 passes',
    failing: '2.5.3 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await lab.getByLabel('aria-label', { exact: true }).focus();
      await page.keyboard.press('ControlOrMeta+a');
      await page.keyboard.type('Send message to support');
    },
    said: 'You said “click Send”. It clicked “Send message to support”.',
  },
]);
