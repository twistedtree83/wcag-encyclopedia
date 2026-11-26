import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { InputPurposeLab } from './InputPurposeLab';

export default {
  id: 'input-purpose',
  title: 'Try it: tag the fields',
  criteria: ['1.3.5'],
  steps: {
    goal: 'Tag the Full name, Email and Phone fields so that a browser can fill them in for you.',
    controls:
      'The groups under “Full name”, “Email” and “Phone” each give their field No autocomplete, ' +
      'the right token such as autocomplete="name", or an invented one such as ' +
      'autocomplete="full-name". The markup shows each field’s tag, and After autofill, a screen ' +
      'reader says shows what the simulated autofill put in each field.',
    tryThis:
      'The lab starts with no autocomplete on any field. Choose the right token for all three, ' +
      'then change Email to autocomplete="e-mail" and watch autofill leave it empty.',
    result:
      '1.3.5 passes only when every field has the right token: name, email and tel. With no ' +
      'token or an invented one, the browser can’t tell what a field is for, so people with ' +
      'memory, motor or cognitive difficulties have to type it all themselves. The verdict line ' +
      'under the lab says which.',
  },
  Lab: InputPurposeLab,
} satisfies LabEntry;
