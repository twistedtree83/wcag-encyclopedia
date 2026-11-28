import { labCases, radio } from './support';

/** The captions lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the captions lab on 1.2.2',
    id: 'captions',
    url: '/criteria/1.2.2/',
    lab: '.lab-slot .captions-lab',
    passing: '1.2.2 passes',
    failing: '1.2.2 fails',
    toFail: async (lab, page) => {
      await radio(lab, 'Automatic, never checked').focus();
      await page.keyboard.press('Space');
    },
    said: 'The clip has automatic captions now, never checked.',
  },
  {
    name: 'the live captions lab on 1.2.4',
    id: 'live-captions',
    url: '/criteria/1.2.4/',
    lab: '.lab-slot .captions-lab',
    passing: '1.2.4 passes',
    failing: '1.2.4 fails',
    toFail: async (lab, page) => {
      await radio(lab, 'Missing').focus();
      await page.keyboard.press('Space');
    },
    said: 'The stream has no captions now.',
  },
]);
