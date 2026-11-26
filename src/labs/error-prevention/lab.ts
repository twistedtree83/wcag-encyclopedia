import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { ErrorPreventionLab } from './ErrorPreventionLab';

export default {
  id: 'error-prevention',
  title: 'Try it: catch the wrong payment',
  criteria: ['3.3.4'],
  steps: {
    goal: 'Catch a payment of £2,500.00 to Sam Lee that should have been £250.00.',
    controls:
      'The options under “Safeguard before the money goes” set None: one click pays, A review ' +
      'step, with a way back, or An undo after paying. The Pay £2,500.00 button pays, and the ' +
      'buttons after it follow the safeguard: Go back and correct it and Confirm payment, or ' +
      'Undo the payment and Correct the amount.',
    tryThis:
      'The lab starts on None: one click pays. Press Pay £2,500.00 and see that the money has ' +
      'gone. Then choose A review step, with a way back, or An undo after paying, pay again and ' +
      'correct the amount.',
    result:
      'With either safeguard, 3.3.4 passes: a slip can be caught before or after the money goes. ' +
      'With None: one click pays, 3.3.4 fails, because one mistyped key costs real money, and ' +
      'people with motor, reading or memory difficulties make such slips more often. The verdict ' +
      'line under the lab says which.',
  },
  Lab: ErrorPreventionLab,
} satisfies LabEntry;
