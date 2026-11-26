import { labCases, radio } from './support';

/** The form-errors lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the form errors lab on 3.3.1',
    url: '/criteria/3.3.1/',
    lab: '.lab-slot .flab',
    passing: '3.3.1 passes',
    failing: '3.3.1 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'A red border only').focus();
      await page.keyboard.press('ArrowDown');
      await lab.getByRole('button', { name: 'Submit the form' }).focus();
      await page.keyboard.press('Enter');
    },
    said:
      'Screen reader says: Email; Email, edit text, invalid entry, ada@example, Enter an ' +
      'address that includes a domain; Enter an address that includes a domain. The error is in text, tied ' +
      'to the field.',
  },
]);
