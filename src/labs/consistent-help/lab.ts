import type { LabEntry } from '../shared/labEntry';
import { ConsistentHelpLab } from './ConsistentHelpLab';

export default {
  id: 'consistent-help',
  title: 'Try it: move the help link',
  criteria: ['3.2.6'],
  steps: {
    goal: 'Put the shop’s help link in the same place on every page that has one.',
    controls:
      'The options under “Show the page” move the mock shop between Home, Products and Account. ' +
      'The options under “The help link on” the page you are on put its help link In the header, ' +
      'In the page or In the footer, or choose Not on this page.',
    tryThis:
      'The lab starts with help in a different place on each page. Show each page in turn and ' +
      'put its help link in one place. Then choose Not on this page for one of them.',
    result:
      'When every page with help has it in the same place, 3.2.6 passes, even if some pages have ' +
      'none. When help moves between pages, 3.2.6 fails, because people who need help, often ' +
      'when they are already struggling, have to hunt for it again. The verdict line under the ' +
      'lab says which.',
  },
  Lab: ConsistentHelpLab,
} satisfies LabEntry;
