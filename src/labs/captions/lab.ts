import type { LabEntry } from '../shared/labEntry';
import { CaptionsLab, LiveCaptionsLab } from './CaptionLabs';

export default [
  {
    id: 'captions',
    title: 'Try it: caption the briefing',
    criteria: ['1.2.2'],
    Lab: CaptionsLab,
  },
  {
    id: 'live-captions',
    title: 'Try it: caption the live stream',
    criteria: ['1.2.4'],
    Lab: LiveCaptionsLab,
  },
] satisfies readonly LabEntry[];
