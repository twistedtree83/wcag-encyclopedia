import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { ImagesOfTextLab } from './ImagesOfTextLab';

export default {
  id: 'images-of-text',
  title: 'Try it: zoom and restyle the heading',
  criteria: ['1.4.5'],
  steps: {
    goal:
      'Compare a sale heading set as real text with the same heading as a picture, when a reader ' +
      'zooms in or uses their own colours.',
    controls:
      'The choices under “The heading” make it Real text or an Image of text. The choices under ' +
      '“Zoom” set the page to 100%, 200% or 400%, and the choices under “Colours” switch between ' +
      'The page’s own and Mine, the reader’s own colours. The readouts say whether the heading ' +
      'stays sharp and whether it follows your colours.',
    tryThis:
      'The lab starts with Real text, and passes. Choose Image of text, then 400% to see its ' +
      'pixels stretched and blurred, and Mine to see it keep its own colours while the line ' +
      'under it changes.',
    result:
      'With Real text, 1.4.5 passes: it stays sharp at any zoom and takes the reader’s colours. ' +
      'With Image of text, 1.4.5 fails at every zoom and colour setting, because people with low ' +
      'vision can’t enlarge it cleanly or restyle it to read. The verdict line under the lab ' +
      'says which.',
  },
  Lab: ImagesOfTextLab,
} satisfies LabEntry;
