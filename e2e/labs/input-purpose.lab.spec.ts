import { labCases, radio } from './support';

/** The input-purpose lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the tag-the-fields lab on 1.3.5',
    url: '/criteria/1.3.5/',
    lab: '.lab-slot .ip-lab',
    passing: '1.3.5 passes',
    failing: '1.3.5 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      for (const field of ['Full name', 'Email', 'Phone']) {
        const group = lab.getByRole('group', { name: field, exact: true });
        await radio(group, 'No autocomplete').focus();
        await page.keyboard.press('ArrowDown');
      }
    },
    said: 'Autofill filled 3 of 3 fields.',
  },
]);
