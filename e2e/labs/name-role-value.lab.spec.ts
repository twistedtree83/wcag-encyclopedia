import { labCases, axeStates, radio } from './support';

/** The name-role-value lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the name, role and value lab on 4.1.2',
    url: '/criteria/4.1.2/',
    lab: '.lab-slot .nrv-lab',
    passing: '4.1.2 passes',
    failing: '4.1.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'A plain div').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await radio(lab, 'None: the text sits beside it').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await radio(lab, 'None').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
    },
    said:
      'Screen reader says: Email notifications, switch, on; Email notifications. ' +
      'Role, name and state all exposed.',
  },
]);

/** The lab's URL states, scanned by axe in four modes. */
axeStates([
  '/criteria/4.1.2/?el=switch&name=aria-label&state=aria-checked&on=1',
  '/criteria/4.1.2/?el=button&name=content&state=aria-pressed&on=0',
  '/criteria/4.1.2/?el=role-button&name=labelledby&state=aria-checked&on=1',
  '/criteria/4.1.2/?el=switch&name=none&state=aria-pressed&on=0',
]);
