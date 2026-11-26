import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { AltTextLab } from './AltTextLab';

export default {
  id: 'alt-text',
  title: 'Try it: write the alt text',
  criteria: ['1.1.1'],
  steps: {
    goal: 'Give the image alt text that tells a screen reader user what it is there for.',
    controls:
      '“The image” picks a product photo or a decorative divider. “Its alt text” picks a ' +
      'ready-made alt: Leave it out, The file name, Decorative: alt="" or Describe it, and the ' +
      'Or write your own alt text field takes your own words instead. The markup and Screen ' +
      'reader says show what is read out.',
    tryThis:
      'The lab starts with the photo’s alt left out. Choose The file name, then Describe it, or ' +
      'type a word like “image” in the Or write your own alt text field. Then pick the divider ' +
      'under “The image” and choose Decorative: alt="".',
    result:
      '1.1.1 passes when the photo is named by what it shows, or the divider has alt="" so it is ' +
      'skipped. With no alt, a file name or just “image”, people using a screen reader learn ' +
      'nothing about what is for sale, and a named divider is only noise. The verdict line under ' +
      'the lab says which.',
  },
  flagshipFor: '1.1.1',
  Lab: AltTextLab,
} satisfies LabEntry;
