import { labCases, axeStates } from './support';

/** The structure lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the structure lab on 1.3.1',
    url: '/criteria/1.3.1/',
    lab: '.lab-slot .st-lab',
    passing: '1.3.1 passes',
    failing: '1.3.1 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      for (const part of ['The heading is an <h3>', 'The list is a <ul> of <li>', 'Each field has a <label for>']) {
        await lab.getByRole('checkbox', { name: part }).focus();
        await page.keyboard.press('Space');
      }
    },
    said: 'In the markup: heading, list and labels. Nothing is only styled.',
  },
]);

/** The lab's URL states, scanned by axe in four modes. */
axeStates([
  '/criteria/1.3.1/?mock=table',
  '/criteria/1.3.1/?mock=form&real=heading,list,labels',
]);
