import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { ReflowLab } from './ReflowLab';

export default {
  id: 'reflow',
  title: 'Try it: zoom to 400%',
  criteria: ['1.4.10'],
  steps: {
    goal: 'Zoom a catalogue page to 400% and read it without scrolling sideways.',
    controls:
      'The choices under “Zoom” set the browser to 100%, 200% or 400%; each step leaves fewer ' +
      'CSS pixels, the units a page is laid out in, across the window: 320 at 400%. The choices ' +
      'under “Page layout” make the page Fixed width, 960 CSS pixels wide, or Reflows, so it ' +
      'narrows to one column. The readouts give the window size and say which ways the page ' +
      'scrolls.',
    tryThis:
      'The lab starts at 100% with Fixed width, and passes. Choose 200% or 400% and watch the ' +
      'page scroll sideways as well as down. Then choose Reflows.',
    result:
      'If the page fits the window’s width at 400% and only scrolls down, 1.4.10 passes. If it ' +
      'has to scroll sideways as well, 1.4.10 fails: people who zoom in to read must scroll back ' +
      'and forth along every line. The verdict line under the lab says which.',
  },
  flagshipFor: '1.4.10',
  Lab: ReflowLab,
} satisfies LabEntry;
