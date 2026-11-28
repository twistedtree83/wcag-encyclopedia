import { labCases, radio } from './support';

/** The timing lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the carousel lab on 2.2.2',
    id: 'stop-carousel',
    url: '/criteria/2.2.2/',
    lab: '.lab-slot .carousel-lab',
    passing: '2.2.2 passes',
    failing: '2.2.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'No control').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'A Pause button. Keeps moving. Passes: the reader can pause it.',
  },
  {
    name: 'the autoplay lab on 1.4.2',
    id: 'audio-control',
    url: '/criteria/1.4.2/',
    lab: '.lab-slot .audio-lab',
    passing: '1.4.2 passes',
    failing: '1.4.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'No control').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Pause at the top. Plays on a loop. Passes: the reader can pause it.',
  },
  {
    name: 'the flash rate lab on 2.3.1',
    id: 'flash-rate',
    url: '/criteria/2.3.1/',
    lab: '.lab-slot .flash-lab',
    passing: '2.3.1 passes',
    failing: '2.3.1 fails',
    toFail: async (lab, page) => {
      await radio(lab, '2 flashes a second').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
    },
    said: '4 flashes a second. Fails: over the limit of 3 a second.',
  },
]);
