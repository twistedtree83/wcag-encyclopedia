import { labCases, axeStates, typeHex, colourToFail, COLOUR_SAID } from './support';

/** The colour-check lab's cases for the shared lab bar (`support.ts`). */
labCases([
  {
    name: 'the colour check on 1.4.3',
    id: 'colour-check',
    url: '/criteria/1.4.3/',
    lab: '.lab-slot form.chk',
    passing: '1.4.3 passes',
    failing: '1.4.3 fails',
    toFail: colourToFail,
    said: COLOUR_SAID,
  },
  {
    name: 'the colour check on 1.4.11',
    id: 'colour-check',
    url: '/criteria/1.4.11/',
    lab: '.lab-slot form.chk',
    passing: '1.4.11 passes',
    failing: '1.4.11 fails',
    toFail: async (lab, page) => {
      await typeHex(lab, page, 'Text colour hex code', '#BBBBBB');
      await typeHex(lab, page, 'Background hex code', '#FFFFFF');
    },
    said: '1.91 to 1. Fails for text and for controls.',
  },
  {
    name: 'the colour check on 1.4.1',
    id: 'colour-check',
    url: '/criteria/1.4.1/',
    lab: '.lab-slot form.chk',
    passing: '1.4.1 passes',
    failing: '1.4.1 fails',
    toFail: colourToFail,
    said: COLOUR_SAID,
  },
  {
    name: 'the wide colour check',
    id: 'colour-check',
    url: '/colour-check/',
    lab: '#cc',
    passing: '1.4.3 passes',
    failing: '1.4.3 fails',
    toFail: colourToFail,
    said: COLOUR_SAID,
  },
  {
    name: 'the hero colour check on Home',
    id: 'colour-check',
    url: '/',
    lab: '#hc',
    passing: '1.4.3 passes',
    failing: '1.4.3 fails',
    toFail: colourToFail,
    said: COLOUR_SAID,
  },
]);

/** The lab's URL states, scanned by axe in four modes. */
axeStates([
  '/colour-check/?fg=999999&bg=FFFFFF',
  '/colour-check/?fg=595959&bg=FFFFFF',
]);
