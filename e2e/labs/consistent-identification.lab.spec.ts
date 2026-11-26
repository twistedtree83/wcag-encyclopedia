import { labCases, radio } from './support';

/** The consistent-identification lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the name-the-search-button lab on 3.2.4',
    url: '/criteria/3.2.4/',
    lab: '.lab-slot .id-lab',
    passing: '3.2.4 passes',
    failing: '3.2.4 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      // Home is “Search”: show Products, name it “Search”; then Support, the same.
      for (const from of ['Home', 'Products']) {
        await radio(lab, from).focus();
        await page.keyboard.press('ArrowDown');
        await radio(lab, 'Search').focus();
        await page.keyboard.press('Space');
      }
    },
    said: 'The search button has one name on every page: “Search”. On Support it reads “Search”.',
  },
]);
