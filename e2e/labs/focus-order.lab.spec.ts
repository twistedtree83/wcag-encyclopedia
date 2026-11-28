import { labCases, axeStates, radio } from './support';

/** The focus-order lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the focus order lab on 2.4.3',
    id: 'focus-order',
    url: '/criteria/2.4.3/',
    lab: '.lab-slot .fo-lab',
    passing: '2.4.3 passes',
    failing: '2.4.3 fails',
    toFail: async (lab, page) => {
      await radio(lab, 'None').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Focus goes Postcode, Name, Email, Phone, Send. It leaves the layout at stop 1.',
  },
]);

/** The lab's URL states, scanned by axe in four modes. */
axeStates([
  '/criteria/2.4.3/?src=columns&ti=none',
  '/criteria/2.4.3/?src=send-first&ti=postcode',
  '/criteria/2.4.3/?src=layout&ti=send',
]);
