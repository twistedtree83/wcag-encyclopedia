import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { DescriptionLab, MediaAlternativeLab, MediaOnlyLab } from './MediaAltLabs';

export default [
  {
    id: 'media-only',
    title: 'Try it: give each clip its alternative',
    criteria: ['1.2.1'],
    steps: {
      goal: 'Give an audio-only episode and a silent clip each the text alternative it needs.',
      controls:
        'Play and the position slider run both clips together. The tick boxes under ' +
        '“Alternatives” add or take away A transcript for the episode and A text description for ' +
        'the silent clip, which appear as text under the player. Episode, heard now and Silent ' +
        'clip, shown now show what each clip carries at that moment.',
      tryThis:
        'Untick A transcript for the episode. Then tick it again, untick A text description for ' +
        'the silent clip, and press Play to see what the page would lose.',
      result:
        '1.2.1 passes only with both ticked. Without the transcript, people who can’t hear miss ' +
        'the whole episode, and without the text description, people who can’t see miss the ' +
        'whole silent clip. The verdict line under the lab says which.',
    },
    Lab: MediaOnlyLab,
  },
  {
    id: 'media-alternative',
    title: 'Try it: carry what the camera shows',
    criteria: ['1.2.3'],
    steps: {
      goal:
        'Make sure someone who can’t see the sewing demonstration still learns how to finish the ' +
        'corner.',
      controls:
        'Play and the position slider run the clip. “Alongside the clip” adds Captions only, ' +
        'Captions and a transcript of the dialogue, Captions and a described transcript, or ' +
        'Captions and an audio description track. Shown now, Heard now and Described now show ' +
        'what the picture, the soundtrack and any description carry at the same moment.',
      tryThis:
        'Press Play and pause where Sam says “Then you just do this”. Choose Captions only, then ' +
        'Captions and a transcript of the dialogue, and compare Shown now with Heard now.',
      result:
        '1.2.3 passes with a described transcript or an audio description track, because both ' +
        'say what Sam’s hands do. Captions and a plain transcript only repeat “do this”, so ' +
        'blind and low-vision viewers never learn the fold. The verdict line under the lab says ' +
        'which.',
    },
    Lab: MediaAlternativeLab,
  },
  {
    id: 'description',
    title: 'Try it: describe into the gaps',
    criteria: ['1.2.5'],
    steps: {
      goal:
        'Make the budget review’s silent decisions available to someone who can’t see the ' +
        'whiteboard.',
      controls:
        'Play and the position slider run the clip. “Description” sets it to No description, A ' +
        'described transcript only, or Description cues, in the gaps. Shown now, Heard now and ' +
        'Described now show what the picture, the soundtrack and any description carry at the ' +
        'same moment.',
      tryThis:
        'Press Play and watch Described now as Lena crosses out Events. Then choose A described ' +
        'transcript only, then No description, and play it again.',
      result:
        'Only Description cues, in the gaps pass 1.2.5: blind and low-vision viewers hear which ' +
        'column was cut and which total was kept while the video plays. A described transcript ' +
        'is enough for 1.2.3 but not here, and no description leaves those decisions unseen. The ' +
        'verdict line under the lab says which.',
    },
    Lab: DescriptionLab,
  },
] satisfies readonly LabEntry[];
