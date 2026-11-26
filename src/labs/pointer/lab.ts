import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { DraggingMovementsLab, MotionActuationLab, PointerCancellationLab, PointerGesturesLab } from './PointerLabs';

export default [
  {
    id: 'pointer-gestures',
    title: 'Try it: give the map buttons',
    criteria: ['2.5.1'],
    Lab: PointerGesturesLab,
  },
  {
    id: 'pointer-cancellation',
    title: 'Try it: slide off the button',
    criteria: ['2.5.2'],
    Lab: PointerCancellationLab,
  },
  {
    id: 'motion-actuation',
    title: 'Try it: shake to undo',
    criteria: ['2.5.4'],
    Lab: MotionActuationLab,
  },
  {
    id: 'dragging-movements',
    title: 'Try it: reorder without dragging',
    criteria: ['2.5.7'],
    Lab: DraggingMovementsLab,
  },
] satisfies readonly LabEntry[];
