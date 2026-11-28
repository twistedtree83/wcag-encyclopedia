import { labCases } from './support';

/** The fade-text lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'fade-the-text on 1.4.3',
    id: 'fade-text',
    url: '/criteria/1.4.3/',
    lab: '.lab-slot .fade-lab',
    passing: '1.4.3 passes',
    failing: '1.4.3 fails',
    toFail: async (lab, page) => {
      await lab.getByRole('slider', { name: 'Fade the text' }).focus();
      await page.keyboard.press('End');
    },
    said: '100% faded. Contrast ratio 1.29 : 1. Fails body text AA, fails large text AA, fails body text AAA.',
  },
  {
    name: 'fade-the-text on Home',
    id: 'fade-text',
    url: '/',
    lab: '#lab .fade-lab',
    passing: '1.4.3 passes',
    failing: '1.4.3 fails',
    toFail: async (lab, page) => {
      await lab.getByRole('slider', { name: 'Fade the text' }).focus();
      await page.keyboard.press('End');
    },
    said: '100% faded. Contrast ratio 1.29 : 1. Fails body text AA, fails large text AA, fails body text AAA.',
  },
]);
