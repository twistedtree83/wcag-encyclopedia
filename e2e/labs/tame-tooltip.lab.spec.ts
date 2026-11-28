import { labCases } from './support';

/** The tame-tooltip lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the tame-the-tooltip lab on 1.4.13',
    id: 'tame-tooltip',
    url: '/criteria/1.4.13/',
    lab: '.lab-slot .tip-lab',
    passing: '1.4.13 passes',
    failing: '1.4.13 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      const conditions = ['Escape closes it', 'The pointer can move into it', 'It stays until dismissed'];
      for (const condition of conditions) {
        await lab.getByRole('checkbox', { name: condition }).focus();
        await page.keyboard.press('Space');
      }
    },
    said: 'Escape closes it, the pointer can move into it, and it stays until dismissed.',
  },
]);
