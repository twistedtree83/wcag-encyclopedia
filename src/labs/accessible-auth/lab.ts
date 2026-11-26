import type { LabEntry } from '../shared/labEntry';
import { AccessibleAuthLab } from './AccessibleAuthLab';

export default {
  id: 'accessible-auth',
  title: 'Try it: sign in without a test',
  criteria: ['3.3.8'],
  steps: {
    goal: 'Sign in without having to remember, transcribe or solve anything.',
    controls:
      'The options under “Signing in asks for” set what the mock sign-in asks of you: A picture ' +
      'puzzle, A password, paste blocked, A password, paste allowed, or A passkey or emailed ' +
      'link. The Fill from a password manager button tries to fill the sign-in for you.',
    tryThis:
      'The lab starts on A password, paste blocked. Press Fill from a password manager and see ' +
      'the field stay empty. Then try A picture puzzle, A password, paste allowed and A passkey ' +
      'or emailed link in turn.',
    result:
      'With A password, paste allowed or A passkey or emailed link, 3.3.8 passes: a password ' +
      'manager or the device does the remembering. With A picture puzzle or A password, paste ' +
      'blocked, 3.3.8 fails, because people with memory, reading or thinking difficulties are ' +
      'set a test they may not pass. The verdict line under the lab says which.',
  },
  Lab: AccessibleAuthLab,
} satisfies LabEntry;
