import { labCases, radio } from './support';

/** The form-labels lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the form labels lab on 3.3.2',
    url: '/criteria/3.3.2/',
    lab: '.lab-slot .flab',
    passing: '3.3.2 passes',
    failing: '3.3.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'A placeholder only').focus();
      await page.keyboard.press('ArrowDown');
      await lab.getByLabel('Type into the field').focus();
      await page.keyboard.type('27 3 1995');
    },
    said:
      'Screen reader says: Date of birth; For example, 27 3 1995; Date of birth, edit text, ' +
      '27 3 1995, For example, 27 3 1995. On screen: “Date of birth” and “For example, 27 3 1995”, above ' +
      'the field.',
  },
]);
