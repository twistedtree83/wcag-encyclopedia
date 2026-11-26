import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { ColourCheckLab } from './ColourCheck';

export default {
  id: 'colour-check',
  title: 'Try it: check your own colours',
  criteria: ['1.4.1', '1.4.3', '1.4.11'],
  steps: {
    goal:
      'Pick a text colour and a background, and find out whether people can read one on the ' +
      'other.',
    controls:
      'The Text colour and Background fields each take a colour from a picker or a hex code, and ' +
      'the Swap text and background colours button swaps them. The preview is drawn in your two ' +
      'colours, and Contrast ratio, the 1–21 scale and the checks show how the pair measures ' +
      'against each threshold. Preview in greyscale shows the preview without colour, and when ' +
      'body text fails, the Use button sets the closest passing text colour.',
    tryThis:
      'The lab starts with near-black text on yellow, which passes easily. Type #999999 in the ' +
      'Text colour hex field and #FFFFFF in the Background hex field, then press the Use button ' +
      'to fix the pair.',
    result:
      'On 1.4.3 and 1.4.1 the verdict line under the lab says whether body text reaches 4.5 : 1, ' +
      'the 1.4.3 level. On 1.4.11 it says whether borders and icons reach 3 : 1. Below that, ' +
      'people with low vision, or anyone on a dim screen, can’t read the text or make out the ' +
      'control.',
  },
  flagshipFor: '1.4.3',
  Lab: ColourCheckLab,
} satisfies LabEntry;
