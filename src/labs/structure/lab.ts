import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { StructureLab } from './StructureLab';

export default {
  id: 'structure',
  title: 'Try it: build the structure',
  criteria: ['1.3.1'],
  steps: {
    goal:
      'Build a mock form or table so that a screen reader finds its structure, not just its ' +
      'look.',
    controls:
      '“The mock” switches between A form and A table. Each tick box under “Built from real ' +
      'elements”, such as The heading is an <h3>, rebuilds one part with the real element, and ' +
      'nothing changes on screen. Screen reader says lists the structure a screen reader finds.',
    tryThis:
      'The lab starts with every part built from styled divs. Tick the boxes under “Built from ' +
      'real elements” one at a time and watch Screen reader says gain a heading, a list and ' +
      'named fields. Then choose A table and do the same.',
    result:
      '1.3.1 passes once every part of the mock is a real element. While any part is only ' +
      'styled, people using a screen reader can’t tell a heading, a list, a field’s label or a ' +
      'table header from plain text, even though it looks right. The verdict line under the lab ' +
      'says which.',
  },
  flagshipFor: '1.3.1',
  Lab: StructureLab,
} satisfies LabEntry;
