import type { LabEntry } from '../shared/labEntry';
import { ErrorSuggestionLab } from './ErrorSuggestionLab';

export default {
  id: 'error-suggestion',
  title: 'Try it: suggest the fix',
  criteria: ['3.3.3'],
  steps: {
    goal: 'Tell someone how to fix a date they typed in the wrong format.',
    controls:
      'The options under “What the error says” set the mock form’s error message: “Invalid ' +
      'input”, or The format, with an example. The Submit the form button sends the date ' +
      '05/03/26, which has a two-digit year and is rejected. The log shows what a screen reader ' +
      'says.',
    tryThis:
      'The lab starts on “Invalid input”. Press Submit the form and read the error. Then choose ' +
      'The format, with an example and read it again.',
    result:
      'With The format, with an example, 3.3.3 passes: the error says how to put it right. With ' +
      '“Invalid input”, 3.3.3 fails, because people only learn that something is wrong, and many, ' +
      'including people with learning or memory difficulties, can’t work out the fix. The ' +
      'verdict line under the lab says which.',
  },
  Lab: ErrorSuggestionLab,
} satisfies LabEntry;
