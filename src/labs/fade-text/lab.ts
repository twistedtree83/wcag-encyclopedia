import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { FadeLab } from './FadeLab';

export default {
  id: 'fade-text',
  title: 'Try it: fade the text',
  criteria: ['1.4.3'],
  steps: {
    goal: 'Fade the opening hours text until it is too faint to read, and see where that happens.',
    controls:
      'The Fade the text slider fades the text towards its dark background, from 0% faded to ' +
      '100% faded. Contrast ratio shows the ratio on a 1–21 scale, and the checks say whether it ' +
      'meets each text threshold, as in “Body text needs at least 4.5 : 1.”',
    tryThis:
      'The lab starts at 18% faded. Drag Fade the text past about 60% faded, where body text ' +
      'drops below 4.5 : 1, then past about 73%, where large text drops below 3 : 1.',
    result:
      '1.4.3 passes while the text has at least 4.5 : 1 against its background, the level for ' +
      'body text, and fails below that. Fainter text is hard or impossible to read for people ' +
      'with low vision, and for anyone on a dim screen or in bright sun. The verdict line under ' +
      'the lab says which.',
  },
  Lab: FadeLab,
} satisfies LabEntry;
