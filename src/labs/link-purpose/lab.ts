import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { LinkPurposeLab } from './LinkPurposeLab';

export default {
  id: 'link-purpose',
  title: 'Try it: name the links',
  criteria: ['2.4.4'],
  steps: {
    goal: 'Make three news links say where they go.',
    controls:
      'The options under “Link text” set each link’s words: “Read more”, “Click here”, or ' +
      'words that name the destination. The options under “The sentence before it” add no ' +
      'sentence, a vague “New this week.”, or a sentence that names the link. The “Links list ' +
      'says” log reads the links out of context, as a screen reader’s links list does.',
    tryThis:
      'The lab starts on “Read more” with no sentence, which fails. Pick A sentence that names ' +
      'it, then pick Names the destination, and compare the links list each time.',
    result:
      '2.4.4 passes when the link text, or the sentence beside it, names where the link goes. ' +
      'It fails when nothing does, because screen reader users hear a row of links that all ' +
      'sound the same. The verdict line under the lab says which; a naming sentence passes, ' +
      'but only link text that names the destination helps in the links list.',
  },
  Lab: LinkPurposeLab,
} satisfies LabEntry;
