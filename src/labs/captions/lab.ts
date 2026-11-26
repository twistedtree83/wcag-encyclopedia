import type { LabEntry } from '../shared/labEntry';
import { CaptionsLab, LiveCaptionsLab } from './CaptionLabs';

export default [
  {
    id: 'captions',
    title: 'Try it: caption the briefing',
    criteria: ['1.2.2'],
    steps: {
      goal: 'Give the recorded briefing captions that someone who can’t hear it can follow.',
      controls:
        'Play and the position slider run the clip. “Captions on this clip” sets its captions to ' +
        'None, Automatic, never checked, or Accurate, checked. Heard now and Captions now show ' +
        'what is said and what the captions show at the same moment.',
      tryThis:
        'Press Play, then choose Automatic, never checked and play it again. Compare Heard now ' +
        'with Captions now, then choose None.',
      result:
        'Only Accurate, checked passes 1.2.2. Unchecked automatic captions garble words like ' +
        '“Friday” and leave out the alarm, and no captions leave out everything, so deaf and ' +
        'hard of hearing viewers miss what the clip says. The verdict line under the lab says ' +
        'which.',
    },
    Lab: CaptionsLab,
  },
  {
    id: 'live-captions',
    title: 'Try it: caption the live stream',
    criteria: ['1.2.4'],
    steps: {
      goal:
        'Caption the live all-hands so that someone who can’t hear it can follow it as it ' +
        'happens.',
      controls:
        'Go live starts the stream and Pause stops it. “Live captions” sets the captions to In ' +
        'step with the speaker, Lagging 6 seconds behind, or Missing. Heard now and Captions now ' +
        'show what is said and what the captions show at the same moment.',
      tryThis:
        'Press Go live, then choose Lagging 6 seconds behind and watch Captions now trail Heard ' +
        'now by a whole line. Then choose Missing.',
      result:
        'Only captions in step with the speaker pass 1.2.4. Captions a whole line behind, or ' +
        'none at all, leave deaf and hard of hearing viewers unable to take part as it happens, ' +
        'for example by asking a question in the chat. The verdict line under the lab says ' +
        'which.',
    },
    Lab: LiveCaptionsLab,
  },
] satisfies readonly LabEntry[];
