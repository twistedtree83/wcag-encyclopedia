import { labCases, radio } from './support';

/** The error-suggestion lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the error suggestion lab on 3.3.3',
    id: 'error-suggestion',
    url: '/criteria/3.3.3/',
    lab: '.lab-slot .eslab',
    passing: '3.3.3 passes',
    failing: '3.3.3 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, '“Invalid input”').focus();
      await page.keyboard.press('ArrowDown');
      await lab.getByRole('button', { name: 'Submit the form' }).focus();
      await page.keyboard.press('Enter');
    },
    said:
      'Screen reader says: Date; Date, edit text, invalid entry, 05/03/26, Use DD/MM/YYYY, for example ' +
      '05/03/2026; Use DD/MM/YYYY, for example 05/03/2026. It says how to put it right.',
  },
]);
