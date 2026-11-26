import type { LabEntry } from '../shared/labEntry';
import { ConsistentIdLab } from './ConsistentIdLab';

export default {
  id: 'consistent-identification',
  title: 'Try it: name the search button',
  criteria: ['3.2.4'],
  steps: {
    goal: 'Give the shop’s search button the same name on every page.',
    controls:
      'The options under “Show the page” move the mock shop between Home, Products and Support. ' +
      'The options under “Name the search button on” the page you are on name its search button ' +
      'Search, Find or Go.',
    tryThis:
      'The lab starts with Search on Home, Find on Products and Go on Support. Show each page in ' +
      'turn and give its search button the same name.',
    result:
      'With one name on every page, 3.2.4 passes, whichever name it is. With two or three names, ' +
      '3.2.4 fails, because people who rely on the name, such as screen reader and voice control ' +
      'users, can’t tell it is the same button. The verdict line under the lab says which.',
  },
  Lab: ConsistentIdLab,
} satisfies LabEntry;
