import { labCases, radio } from './support';

/** The language lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the page language lab on 3.1.1',
    id: 'page-language',
    url: '/criteria/3.1.1/',
    lab: '.lab-slot .lang-lab',
    passing: '3.1.1 passes',
    failing: '3.1.1 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'None').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'The page is read in an English voice.',
  },
  {
    name: 'the language of parts lab on 3.1.2',
    id: 'parts-language',
    url: '/criteria/3.1.2/',
    lab: '.lab-slot .lang-lab',
    passing: '3.1.2 passes',
    failing: '3.1.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await lab.getByRole('checkbox', { name: 'Mark the phrase lang="fr"' }).focus();
      await page.keyboard.press('Space');
    },
    said: 'Défense d’afficher is read in a French voice, then back to English.',
  },
]);
