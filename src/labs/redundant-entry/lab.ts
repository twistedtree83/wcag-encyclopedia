import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { RedundantEntryLab } from './RedundantEntryLab';

export default {
  id: 'redundant-entry',
  title: 'Try it: check out without retyping',
  criteria: ['3.3.7'],
  steps: {
    goal: 'Check out in three steps without typing your address twice.',
    controls:
      'The options under “At billing, the address is” set what the billing step does with the ' +
      'address typed at step 1: Asked for again, Carried forward or Offered for reuse. The Back ' +
      'and Next step buttons move through the mock checkout, from Delivery address to Payment to ' +
      'Billing address.',
    tryThis:
      'The lab starts on Asked for again. Press Next step twice to reach Billing address and ' +
      'read how much there is to type. Then choose Carried forward or Offered for reuse.',
    result:
      'With Carried forward or Offered for reuse, 3.3.7 passes: nothing has to be typed again. ' +
      'With Asked for again, 3.3.7 fails, because people with memory or motor difficulties have ' +
      'to recall and retype what they already gave. The verdict line under the lab says which.',
  },
  Lab: RedundantEntryLab,
} satisfies LabEntry;
