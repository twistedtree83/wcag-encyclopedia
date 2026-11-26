import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { NonTextContrastLab, SensoryLab, UseOfColourLab } from './VisionLabs';

export default [
  {
    id: 'use-of-colour',
    title: 'Try it: take the colour away',
    criteria: ['1.4.1'],
    steps: {
      goal: 'Make the links and the field in error stand out without relying on colour.',
      controls:
        '“Vision filter” shows the mock in Full colour, in Greyscale, or as seen without red, ' +
        'green or blue cones. The tick boxes under “Add a cue that is not colour” are Underline ' +
        'the links and Mark the error with an icon. The results say whether The links and The ' +
        'field in error each stand out or are lost.',
      tryThis:
        'The lab starts failing, because the links and the error differ by colour alone. Choose ' +
        'Greyscale and watch both get lost. Then tick Underline the links and Mark the error ' +
        'with an icon.',
      result:
        '1.4.1 passes only when both still stand out without colour, which the lab judges in ' +
        'greyscale whatever filter you choose. With colour alone, people who see colour weakly ' +
        'or not at all can’t find the links or the field in error. The verdict line under the ' +
        'lab says which.',
    },
    Lab: UseOfColourLab,
  },
  {
    id: 'non-text-contrast',
    title: 'Try it: fade the edges',
    criteria: ['1.4.11'],
    steps: {
      goal: 'Find how faint the edges of a field and a checkbox can get before people lose them.',
      controls:
        'The Fade the edges slider fades the borders of the Email address field and the Email me ' +
        'order updates checkbox towards the white background. “Vision filter” shows the mock in ' +
        'Full colour, in Greyscale, or as seen without red, green or blue cones. Edges against ' +
        'the background gives the contrast ratio, and the check under it says whether it reaches ' +
        '3 : 1.',
      tryThis:
        'Drag Fade the edges from 0% faded to about 30% faded and watch the ratio drop below 3 : ' +
        '1. Then try each filter: the edges are grey, so they barely change.',
      result:
        '1.4.11 passes while the edges have at least 3 : 1 against the background, and fails ' +
        'below that. Fainter edges leave people with low vision unable to see where the field ' +
        'and the checkbox are, so they can’t find them to use them. The verdict line under the ' +
        'lab says which.',
    },
    Lab: NonTextContrastLab,
  },
  {
    id: 'sensory-instruction',
    title: 'Try it: rewrite the instruction',
    criteria: ['1.3.3'],
    steps: {
      goal:
        'Write an instruction that people can follow without seeing the button’s shape, colour ' +
        'or place.',
      controls:
        '“The instruction” picks one of four wordings, from “Press the green button.” to “Press ' +
        'Continue to payment.” “Vision filter” shows the mock in Full colour, in Greyscale, or ' +
        'as seen without red, green or blue cones. The results say whether the instruction names ' +
        'the button, whether the green button stands out, and what is Read aloud.',
      tryThis:
        'The lab starts with “Press the round green button on the right.” Choose No green cones ' +
        '(deuteranopia) and see the green button lost against the red one. Then choose “Press ' +
        'Continue to payment.” and “Press the green Continue to payment button on the right.”',
      result:
        '1.3.3 passes when the instruction names the button, even if it also gives its colour ' +
        'and place. One that points only by shape, colour or position fails people using a ' +
        'screen reader, who hear nothing round or green, and people who can’t tell green from ' +
        'red. The verdict line under the lab says which.',
    },
    Lab: SensoryLab,
  },
] satisfies readonly LabEntry[];
