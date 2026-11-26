import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { OrientationLab } from './OrientationLab';

export default {
  id: 'orientation',
  title: 'Try it: turn the phone',
  criteria: ['1.3.4'],
  steps: {
    goal: 'Make the order-tracking page work whichever way up the phone is held.',
    controls:
      '“Hold the phone” turns the phone to Portrait or Landscape. “The page” sets it to Adapts, ' +
      'Locked to portrait or Locked to landscape. The results give the phone’s window size and ' +
      'say whether the content is shown.',
    tryThis:
      'Choose Locked to portrait, then switch “Hold the phone” to Landscape and watch the page ' +
      'hide everything. Then choose Adapts and turn the phone again.',
    result:
      'Only Adapts passes 1.3.4. A locked page fails even while it is held the way it allows, ' +
      'because someone whose phone is fixed in the other orientation, for example on a ' +
      'wheelchair mount, can’t turn it and is shut out. The verdict line under the lab says ' +
      'which.',
  },
  Lab: OrientationLab,
} satisfies LabEntry;
