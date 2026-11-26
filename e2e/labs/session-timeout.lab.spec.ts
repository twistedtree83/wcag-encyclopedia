import { labCases, axeStates, radio } from './support';

/** The session-timeout lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the session timeout lab on 2.2.1',
    url: '/criteria/2.2.1/',
    lab: '.lab-slot .sess-lab',
    passing: '2.2.1 passes',
    failing: '2.2.1 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'No warning').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
    },
    said: '2 minute limit. Warn 20 seconds ahead. Passes: a 20 second warning, and one action for more time.',
  },
]);

/** The lab's URL states, scanned by axe in four modes. */
axeStates([
  '/criteria/2.2.1/?limit=60&help=none',
  '/criteria/2.2.1/?limit=120&help=adjust',
]);
