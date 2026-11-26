import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { NameRoleValueLab } from './NameRoleValueLab';

export default {
  id: 'name-role-value',
  title: 'Try it: build the toggle',
  criteria: ['4.1.2'],
  steps: {
    goal: 'Build an “Email notifications” toggle that a screen reader can name, describe and read.',
    controls:
      'The options under “Role: the element” pick what the toggle is built from. The options ' +
      'under “Name: where it comes from” give it a name or not, and those under “State: the ' +
      'attribute” pick None, aria-pressed or aria-checked. The Switched on tick box turns the ' +
      'toggle on or off, and the markup and log show the result.',
    tryThis:
      'The lab starts as A plain div with no name and no state. Choose A native <button>, The ' +
      'text inside the control and aria-pressed. Then choose A div with role="switch" and ' +
      'compare aria-pressed with aria-checked.',
    result:
      'When the log gives a role, a name and an on or off state, 4.1.2 passes: aria-pressed ' +
      'suits a button, and aria-checked suits a switch. Leave any one out, or pair the wrong ' +
      'state with the role, and 4.1.2 fails, because screen reader and voice control users can’t ' +
      'tell what the control is, what it’s called or whether it’s on. The verdict line under the ' +
      'lab says which.',
  },
  flagshipFor: '4.1.2',
  Lab: NameRoleValueLab,
} satisfies LabEntry;
