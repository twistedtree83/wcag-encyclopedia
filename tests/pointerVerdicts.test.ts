import { describe, it, expect } from 'vitest';
import {
  CANCEL_START,
  DRAG_START,
  MAP_START,
  MOTION_START,
  cancelSaid,
  cancelVerdict,
  dragSaid,
  dragVerdict,
  mapSaid,
  mapVerdict,
  motionSaid,
  motionVerdict,
  shake,
  slideOff,
} from '../src/labs/pointer/pointerVerdicts';

/**
 * The four pointer labs (#58). Expected verdicts from the criteria themselves: 2.5.1 wants a
 * single-pointer way to do what a multi-finger or path gesture does; 2.5.2 wants the action on
 * the up-event so sliding off cancels; 2.5.4 wants a normal control and a way to turn motion off;
 * 2.5.7 wants a way to reorder without dragging.
 */

describe('2.5.1: the map', () => {
  it('fails with pinch only, and passes with + and − buttons too', () => {
    expect(MAP_START).toEqual({ zoom: 'pinch' });
    expect(mapVerdict(MAP_START)).toEqual({ criterion: '2.5.1', passes: false });
    expect(mapVerdict({ zoom: 'buttons' })).toEqual({ criterion: '2.5.1', passes: true });
  });

  it('says what one finger can do', () => {
    expect(mapSaid({ zoom: 'pinch' })).toBe('Pinch only. One finger has no way to zoom. Fails.');
    expect(mapSaid({ zoom: 'buttons' })).toBe('Pinch, or the + and − buttons. One finger can zoom. Passes.');
  });
});

describe('2.5.2: the button', () => {
  it('fails when it acts on pointer down, passes on pointer up', () => {
    expect(CANCEL_START).toEqual({ fires: 'down', last: null });
    expect(cancelVerdict(CANCEL_START)).toEqual({ criterion: '2.5.2', passes: false });
    expect(cancelVerdict({ fires: 'up', last: null })).toEqual({ criterion: '2.5.2', passes: true });
  });

  it('deletes on the way down whatever the slide does, and cancels on pointer up', () => {
    expect(slideOff({ fires: 'down', last: null })).toEqual({ fires: 'down', last: 'deleted' });
    expect(slideOff({ fires: 'up', last: null })).toEqual({ fires: 'up', last: 'cancelled' });
  });

  it('says the setting, then what sliding off did', () => {
    expect(cancelSaid({ fires: 'down', last: null })).toBe('Acts on pointer down. Fails.');
    expect(cancelSaid({ fires: 'up', last: null })).toBe('Acts on pointer up. Passes.');
    expect(cancelSaid({ fires: 'down', last: 'deleted' })).toBe(
      'Pressed Delete draft and slid off. It was deleted the moment the pointer went down.',
    );
    expect(cancelSaid({ fires: 'up', last: 'cancelled' })).toBe(
      'Pressed Delete draft and slid off. Nothing was deleted.',
    );
  });
});

describe('2.5.4: shake to undo', () => {
  it('passes only with an Undo button and a way to turn shaking off', () => {
    expect(MOTION_START).toEqual({ button: false, shaking: 'always', last: null });
    expect(motionVerdict(MOTION_START).passes).toBe(false);
    expect(motionVerdict({ button: true, shaking: 'always', last: null }).passes).toBe(false);
    expect(motionVerdict({ button: false, shaking: 'on', last: null }).passes).toBe(false);
    expect(motionVerdict({ button: true, shaking: 'on', last: null })).toEqual({ criterion: '2.5.4', passes: true });
    expect(motionVerdict({ button: true, shaking: 'off', last: null }).passes).toBe(true);
  });

  it('undoes on a shake unless shaking is turned off', () => {
    expect(shake(MOTION_START).last).toBe('undid');
    expect(shake({ button: true, shaking: 'off', last: null }).last).toBe('ignored');
  });

  it('says the setting, then what the shake did', () => {
    expect(motionSaid(MOTION_START)).toBe('No Undo button. Shake to undo is always on. Fails.');
    expect(motionSaid({ button: true, shaking: 'on', last: null })).toBe(
      'An Undo button. Shake to undo is on, and can be turned off. Passes.',
    );
    expect(motionSaid({ button: true, shaking: 'off', last: null })).toBe(
      'An Undo button. Shake to undo is turned off. Passes.',
    );
    expect(motionSaid({ ...MOTION_START, last: 'undid' })).toBe('Shook the phone. Undid the archive.');
    expect(motionSaid({ button: true, shaking: 'off', last: 'ignored' })).toBe(
      'Shook the phone. Shake to undo is off, so nothing happened.',
    );
  });
});

describe('2.5.7: the sortable list', () => {
  it('fails with dragging only, passes with move up and move down too', () => {
    expect(DRAG_START).toEqual({ reorder: 'drag' });
    expect(dragVerdict(DRAG_START)).toEqual({ criterion: '2.5.7', passes: false });
    expect(dragVerdict({ reorder: 'buttons' })).toEqual({ criterion: '2.5.7', passes: true });
    expect(dragSaid({ reorder: 'drag' })).toBe('Dragging only. Without a drag, nothing can be moved. Fails.');
    expect(dragSaid({ reorder: 'buttons' })).toBe(
      'Dragging, or the move up and move down buttons. Each row can be moved with a single tap. Passes.',
    );
  });
});
