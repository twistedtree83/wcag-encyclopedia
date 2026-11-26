import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { BypassLab } from './BypassLab';

export default {
  id: 'skip-link',
  title: 'Try it: count the Tab presses',
  criteria: ['2.4.1'],
  steps: {
    goal: 'Get from the top of the mock page to the article with the keyboard alone.',
    controls:
      'The “Skip link, first on the page” tick box, under Bypass, adds or takes away a Skip to ' +
      'content link before the logo. The Links in the menu slider sets how many links sit ' +
      'between the logo and the search field. The count under “To reach the article” says how ' +
      'many Tab presses it takes.',
    tryThis:
      'Untick the skip link and watch the count. Then drag Links in the menu up to 30, and tick ' +
      'the skip link again.',
    result:
      'With the skip link, 2.4.1 passes: one Tab and Enter reach the article, however long the ' +
      'menu. Without it, 2.4.1 fails, because keyboard and switch users must press through ' +
      'every link, on every page. The verdict line under the lab says which.',
  },
  Lab: BypassLab,
} satisfies LabEntry;
