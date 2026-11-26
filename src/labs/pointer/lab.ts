import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { DraggingMovementsLab, MotionActuationLab, PointerCancellationLab, PointerGesturesLab } from './PointerLabs';

export default [
  {
    id: 'pointer-gestures',
    title: 'Try it: give the map buttons',
    criteria: ['2.5.1'],
    steps: {
      goal: 'Let someone zoom a map without pinching.',
      controls:
        'The options under “The map zooms by” switch the mock map between Pinch only and ' +
        'Pinch, or the + and − buttons. The line beside them says what one finger can do.',
      tryThis:
        'The lab starts on Pinch only, which fails. Pick Pinch, or the + and − buttons, then ' +
        'switch back.',
      result:
        'With the + and − buttons, 2.5.1 passes: a single tap does what the pinch does. With ' +
        'pinch only, 2.5.1 fails, because people who use one finger, a head pointer or a mouth ' +
        'stick can’t make a two-finger gesture. The verdict line under the lab says which.',
    },
    Lab: PointerGesturesLab,
  },
  {
    id: 'pointer-cancellation',
    title: 'Try it: slide off the button',
    criteria: ['2.5.2'],
    steps: {
      goal: 'Let someone change their mind after pressing Delete draft.',
      controls:
        'The options under “Delete draft acts on” pick Pointer down, which acts the moment you ' +
        'press, or Pointer up, which waits until you let go. The Press and slide off button ' +
        'acts out pressing Delete draft, sliding off it and letting go.',
      tryThis:
        'The lab starts on Pointer down, which fails. Press Press and slide off, then pick ' +
        'Pointer up and press it again.',
      result:
        'On Pointer up, 2.5.2 passes: sliding off before letting go cancels, and the draft is ' +
        'kept. On Pointer down, 2.5.2 fails, because anyone who presses by mistake, such as ' +
        'people with tremors, has already lost the draft. The verdict line under the lab says ' +
        'which.',
    },
    Lab: PointerCancellationLab,
  },
  {
    id: 'motion-actuation',
    title: 'Try it: shake to undo',
    criteria: ['2.5.4'],
    steps: {
      goal: 'Let someone undo without shaking the phone, and stop a shake from undoing.',
      controls:
        'The options under “Undo button” show or hide an Undo button on the mock phone. The ' +
        'options under “Shake to undo” pick Always on, On, with a setting to turn it off, or ' +
        'Turned off in settings. The Shake the phone button acts out a shake.',
      tryThis:
        'The lab starts with no Undo button and shake always on, which fails. Press Shake the ' +
        'phone. Then pick An Undo button and On, with a setting to turn it off, and try Turned ' +
        'off in settings too.',
      result:
        '2.5.4 passes only with an Undo button and a way to turn shake to undo off. Without ' +
        'both, 2.5.4 fails: people who can’t shake a phone, or whose phone is fixed to a ' +
        'wheelchair, can’t undo, and people with tremors undo by accident. The verdict line ' +
        'under the lab says which.',
    },
    Lab: MotionActuationLab,
  },
  {
    id: 'dragging-movements',
    title: 'Try it: reorder without dragging',
    criteria: ['2.5.7'],
    steps: {
      goal: 'Let someone reorder a list of delivery options without dragging.',
      controls:
        'The options under “Rows are reordered by” switch the mock list between Dragging only ' +
        'and Dragging, or move up and move down buttons. The line beside them says what works ' +
        'without a drag.',
      tryThis:
        'The lab starts on Dragging only, which fails. Pick Dragging, or move up and move down ' +
        'buttons, then switch back.',
      result:
        'With move up and move down buttons, 2.5.7 passes: one tap moves a row. With dragging ' +
        'only, 2.5.7 fails, because people who can’t hold a press while moving, such as people ' +
        'using a head pointer or with tremors, can’t reorder the list. The verdict line under ' +
        'the lab says which.',
    },
    Lab: DraggingMovementsLab,
  },
] satisfies readonly LabEntry[];
