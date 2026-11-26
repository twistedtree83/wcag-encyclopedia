import { labCases, radio } from './support';

/** The accessible-auth lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the accessible authentication lab on 3.3.8',
    url: '/criteria/3.3.8/',
    lab: '.lab-slot .auth-lab',
    passing: '3.3.8 passes',
    failing: '3.3.8 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'A password, paste blocked').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Paste or fill the password. A password manager remembers it for the reader.',
  },
]);
