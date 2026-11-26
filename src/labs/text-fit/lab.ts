import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { ResizeTextLab, TextSpacingLab } from './TextFitLabs';

export default [
  {
    id: 'text-spacing',
    title: 'Try it: loosen the spacing',
    criteria: ['1.4.12'],
    steps: {
      goal:
        'Space out the notice card’s text the way some readers do, and keep all of it readable.',
      controls:
        'The tick boxes under “Text spacing overrides” turn on Line height 1.5, Paragraph ' +
        'spacing 2, Letter spacing 0.12 and Word spacing 0.16, each a multiple of the font size; ' +
        'Apply all four turns on every one. The choices under “Boxes” make the card’s boxes ' +
        'Fixed height or Flexible. The readouts count the overrides that are on and say whether ' +
        'all the text fits.',
      tryThis:
        'The lab starts with no overrides and Fixed height, and passes. Press Apply all four, or ' +
        'tick any one override, and watch the text get cut off. Then choose Flexible under ' +
        '“Boxes”.',
      result:
        'If the boxes grow so all the text still shows with the spacing on, 1.4.12 passes. If ' +
        'any override pushes text out of a fixed-height box, 1.4.12 fails: people with dyslexia ' +
        'or low vision who space text out to read it lose words. The verdict line under the lab ' +
        'says which.',
    },
    flagshipFor: '1.4.12',
    Lab: TextSpacingLab,
  },
  {
    id: 'resize-text',
    title: 'Try it: text to 200%',
    criteria: ['1.4.4'],
    steps: {
      goal: 'Make the notice card’s text twice as large and keep all of it readable.',
      controls:
        'The choices under “Text size” set the card’s text to 100%, 150% or 200%. The choices ' +
        'under “Boxes” make its boxes Locked in px, fixed at the size they were designed at, or ' +
        'Flexible, so they grow with the text. The readouts give the body text size and say ' +
        'whether all the text fits.',
      tryThis:
        'The lab starts at 100% with Locked in px, and passes. Choose 200% and watch the text ' +
        'get cut off. Then choose Flexible.',
      result:
        'If the text can grow to 200% and every box still shows all of it, 1.4.4 passes. If ' +
        'larger text is cut off by a box locked in px, 1.4.4 fails: people with low vision who ' +
        'enlarge text lose some of it. The verdict line under the lab says which.',
    },
    Lab: ResizeTextLab,
  },
] satisfies readonly LabEntry[];
