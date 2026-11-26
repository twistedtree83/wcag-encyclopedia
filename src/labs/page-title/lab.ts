import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { PageTitleLab } from './PageTitleLab';

export default {
  id: 'page-title',
  title: 'Try it: title the page',
  criteria: ['2.4.2'],
  steps: {
    goal: 'Give a checkout page a title that says which page it is.',
    controls:
      'The options under “The page’s title” set the title of the mock Delivery details page: ' +
      'Empty, Generic (“Acme”) or Descriptive (“Delivery details — Acme”). The browser tab ' +
      'shows it, and the log says what a screen reader reads on switching to that tab.',
    tryThis:
      'The lab starts on Generic, which fails. Pick Empty, then Descriptive, and compare what ' +
      'the screen reader says each time.',
    result:
      'Only Descriptive passes 2.4.2: the title says which page this is. Empty and Generic ' +
      'fail, because someone moving between tabs, or hearing the title read first, can’t tell ' +
      'this page from the others. The verdict line under the lab says which.',
  },
  Lab: PageTitleLab,
} satisfies LabEntry;
