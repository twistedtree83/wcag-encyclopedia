import type { LabEntry } from '../shared/labEntry';
import { SessionLab } from './SessionLab';

export default {
  id: 'session-timeout',
  title: 'Try it: time out the session',
  criteria: ['2.2.1'],
  steps: {
    goal: 'Help Sam, who needs four minutes, fill in a form before the session ends.',
    controls:
      'The choices under “Session time limit” set it to 1 minute, 2 minutes or 5 minutes. The ' +
      'choices under “Before it ends” are No warning, Warn 5 seconds ahead, Warn 20 seconds ' +
      'ahead, Offer a longer limit and Offer to turn it off. Wait 20 seconds and Run the clock ' +
      'move a mock clock, and the list beneath says what happens to Sam.',
    tryThis:
      'The lab starts at 2 minutes with No warning, and fails. Press Run the clock and watch ' +
      'Sam’s answers get lost. Then try Warn 5 seconds ahead, Warn 20 seconds ahead and Offer a ' +
      'longer limit, running the clock each time.',
    result:
      'With a warning 20 seconds ahead and a More time button, a limit ten times longer, or the ' +
      'limit turned off, 2.2.1 passes. With no warning, or one too late to act on, 2.2.1 fails, ' +
      'even at 5 minutes when Sam happens to finish: people who read, type or move slowly can’t ' +
      'count on having enough time. The verdict line under the lab says which.',
  },
  flagshipFor: '2.2.1',
  Lab: SessionLab,
} satisfies LabEntry;
