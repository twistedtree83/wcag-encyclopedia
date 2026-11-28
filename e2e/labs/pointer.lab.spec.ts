import { labCases, radio } from './support';

/** The pointer lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the map-buttons lab on 2.5.1',
    id: 'pointer-gestures',
    url: '/criteria/2.5.1/',
    lab: '.lab-slot .pg-lab',
    passing: '2.5.1 passes',
    failing: '2.5.1 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Pinch only').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Pinch, or the + and − buttons. One finger can zoom. Passes.',
  },
  {
    name: 'the slide-off lab on 2.5.2',
    id: 'pointer-cancellation',
    url: '/criteria/2.5.2/',
    lab: '.lab-slot .pc-lab',
    passing: '2.5.2 passes',
    failing: '2.5.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Pointer down').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Acts on pointer up. Passes.',
  },
  {
    name: 'the shake-to-undo lab on 2.5.4',
    id: 'motion-actuation',
    url: '/criteria/2.5.4/',
    lab: '.lab-slot .ma-lab',
    passing: '2.5.4 passes',
    failing: '2.5.4 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'None').focus();
      await page.keyboard.press('ArrowDown');
      await radio(lab, 'Always on').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'An Undo button. Shake to undo is on, and can be turned off. Passes.',
  },
  {
    name: 'the reorder lab on 2.5.7',
    id: 'dragging-movements',
    url: '/criteria/2.5.7/',
    lab: '.lab-slot .dm-lab',
    passing: '2.5.7 passes',
    failing: '2.5.7 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Dragging only').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Dragging, or the move up and move down buttons. Each row can be moved with a single tap. Passes.',
  },
]);
