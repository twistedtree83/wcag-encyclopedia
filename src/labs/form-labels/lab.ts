import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { FormLabelsLab } from './FormLabelsLab';

export default {
  id: 'form-labels',
  title: 'Try it: label the field',
  criteria: ['3.3.2'],
  steps: {
    goal: 'Label a date of birth field so people know what to type, even after they start typing.',
    controls:
      'The options under “What labels the field” set A placeholder only or A visible label and ' +
      'the format. What you type in the Type into the field input appears in the mock field. A ' +
      'line under the lab says what is still on screen, and the log shows what a screen reader ' +
      'says.',
    tryThis:
      'The lab starts on A placeholder only. Type a date into Type into the field and watch the ' +
      'placeholder go. Then choose A visible label and the format and type again.',
    result:
      'With A visible label and the format, 3.3.2 passes: the label and an example stay in view. ' +
      'With A placeholder only, 3.3.2 fails, because the hint vanishes as soon as typing starts, ' +
      'and people who forget it, or never saw it, have nothing to check. The verdict line under ' +
      'the lab says which.',
  },
  Lab: FormLabelsLab,
} satisfies LabEntry;
