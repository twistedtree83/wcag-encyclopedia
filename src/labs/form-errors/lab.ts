import type { LabEntry } from '../shared/labEntry';
import { FormErrorsLab } from './FormErrorsLab';

export default {
  id: 'form-errors',
  title: 'Try it: show the error',
  criteria: ['3.3.1'],
  steps: {
    goal: 'Make a rejected email address clear to someone using a screen reader.',
    controls:
      'The options under “How the error is shown” set how the mock form marks its error: A red ' +
      'border only, or Text tied to the field. The Submit the form button sends the form, which ' +
      'rejects the address ada@example. The log shows what a screen reader says.',
    tryThis:
      'The lab starts on A red border only. Press Submit the form and read the log. Then choose ' +
      'Text tied to the field and compare.',
    result:
      'With Text tied to the field, 3.3.1 passes: the error is said in words with the field. ' +
      'With A red border only, 3.3.1 fails, because people who can’t see the border, or can’t ' +
      'tell red apart, never learn what went wrong. The verdict line under the lab says which.',
  },
  Lab: FormErrorsLab,
} satisfies LabEntry;
