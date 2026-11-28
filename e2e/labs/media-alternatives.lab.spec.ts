import { labCases, radio } from './support';

/** The media-alternatives lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the media-only lab on 1.2.1',
    id: 'media-only',
    url: '/criteria/1.2.1/',
    lab: '.lab-slot .media-only-lab',
    passing: '1.2.1 passes',
    failing: '1.2.1 fails',
    toFail: async (lab, page) => {
      await lab.getByRole('checkbox', { name: 'A transcript for the episode' }).focus();
      await page.keyboard.press('Space');
    },
    said: 'The episode has no transcript now.',
  },
  {
    name: 'the media alternative lab on 1.2.3',
    id: 'media-alternative',
    url: '/criteria/1.2.3/',
    lab: '.lab-slot .media-alt-lab',
    passing: '1.2.3 passes',
    failing: '1.2.3 fails',
    toFail: async (lab, page) => {
      await radio(lab, 'Captions and a transcript of the dialogue').focus();
      await page.keyboard.press('Space');
    },
    said: 'The clip has a transcript of the dialogue now.',
  },
  {
    name: 'the description lab on 1.2.5',
    id: 'description',
    url: '/criteria/1.2.5/',
    lab: '.lab-slot .media-alt-lab',
    passing: '1.2.5 passes',
    failing: '1.2.5 fails',
    toFail: async (lab, page) => {
      await radio(lab, 'A described transcript only').focus();
      await page.keyboard.press('Space');
    },
    said: 'The clip has a described transcript now, but no description track.',
  },
]);
