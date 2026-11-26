import { describe, it, expect } from 'vitest';
import {
  contextLog,
  contextSaid,
  pointerLog,
  pointerSaid,
  type StageEvent,
} from '../src/live/events';
import { trackOf } from '../src/live/focusTrack';
import { nextHover } from '../src/live/pointer';
import {
  FOCUS_START,
  focusSaid,
  focusVerdict,
  pressTab,
  withAct,
} from '../src/labs/on-focus/onFocus';
import { TIP_START, tipAct, tipSaid, tipVerdict, withConditions } from '../src/labs/tame-tooltip/tooltip';

/**
 * 3.2.1 On Focus and 1.4.13 Content on Hover or Focus (#47): the pure parts. The simulated
 * pointer's path, the instruments' lines and sentences, and the two labs' models. Expected text is
 * written out by hand from the criteria, not derived from the code.
 */

const focus = (index: number, total = 3): StageEvent => ({
  kind: 'focus',
  simulated: true,
  line: { name: `Stop ${index + 1}`, role: 'button', states: [], description: '' },
  index,
  total,
  map: { width: 100, height: 40, stops: [] },
});

describe('the simulated pointer', () => {
  it('moves from nowhere onto the first target', () => {
    expect(nextHover([false, false], -1)).toBe(0);
  });

  it('moves on to the next target, then away after the last', () => {
    expect(nextHover([false, false], 0)).toBe(1);
    expect(nextHover([false, false], 1)).toBe(-1);
  });

  it('skips a target that is hidden, such as a tooltip that has closed', () => {
    expect(nextHover([false, true], 0)).toBe(-1);
    expect(nextHover([true, false], -1)).toBe(1);
  });

  it('has nowhere to go when nothing can be hovered', () => {
    expect(nextHover([], -1)).toBe(-1);
  });
});

describe('the pointer and tooltip instrument', () => {
  const events: StageEvent[] = [
    { kind: 'pointer', simulated: true, on: 'the word “incl. duties”' },
    { kind: 'popup', simulated: true, text: 'Duties are estimated at checkout.' },
    { kind: 'pointer', simulated: true, on: 'the tooltip' },
    { kind: 'popup', simulated: true, text: null },
    { kind: 'keys', simulated: true, keys: 'Escape', dictated: false, target: null, actions: [] },
  ];

  it('lists the latest moves, keys and what the tooltip did, oldest first', () => {
    expect(pointerLog(events)).toEqual([
      'Tooltip shows “Duties are estimated at checkout.”',
      'Pointer on the tooltip',
      'Tooltip closes',
      'Pressed Escape',
    ]);
  });

  it('says the last move and what followed it', () => {
    expect(pointerSaid(events.slice(0, 2))).toBe(
      'Pointer on the word “incl. duties”. Tooltip shows “Duties are estimated at checkout.”',
    );
    expect(pointerSaid(events.slice(0, 4))).toBe('Pointer on the tooltip. Tooltip closes.');
    expect(pointerSaid(events)).toBe('Pressed Escape.');
  });

  it('says a move away', () => {
    expect(pointerSaid([{ kind: 'pointer', simulated: false, on: null }])).toBe(
      'Pointer moves away.',
    );
  });

  it('says nothing when the latest event is not about the pointer', () => {
    expect(pointerSaid([...events, focus(0)])).toBeNull();
    expect(pointerSaid([])).toBeNull();
  });
});

describe('the context instrument', () => {
  const events: StageEvent[] = [
    { kind: 'context', simulated: true, address: 'shop.example/help', cause: null },
    focus(0),
    { kind: 'context', simulated: true, address: 'shop.example/delivery', cause: 'focus' },
    { kind: 'context', simulated: true, address: 'shop.example/help', cause: 'action' },
  ];

  it('lists every place the example has been, and what moved it', () => {
    expect(contextLog(events)).toEqual([
      'shop.example/help',
      'shop.example/delivery, on focus alone',
      'shop.example/help, after an action',
    ]);
  });

  it('says a move caused by focus, and one caused by an action', () => {
    expect(contextSaid(events[2] as Extract<StageEvent, { kind: 'context' }>)).toBe(
      'The example moved to shop.example/delivery, on focus alone.',
    );
    expect(contextSaid(events[3] as Extract<StageEvent, { kind: 'context' }>)).toBe(
      'The example moved to shop.example/help, after an action.',
    );
  });

  it('says nothing for where the example started', () => {
    expect(contextSaid(events[0] as Extract<StageEvent, { kind: 'context' }>)).toBe('');
  });

  it('restarts the focus tracker: a new page has its own focus order', () => {
    const track = trackOf([focus(0), focus(1), events[2]!]);
    expect(track.current).toBeNull();
    expect(track.trail).toEqual([]);
    expect(track.map).toBeNull();
    expect(trackOf([focus(0), events[2]!, focus(0, 1)]).trail).toEqual([0]);
  });
});

describe('the 3.2.1 lab', () => {
  it('starts failing: focusing Email submits the form', () => {
    expect(FOCUS_START.act).toBe('submit');
    expect(focusVerdict(FOCUS_START)).toEqual({ criterion: '3.2.1', passes: false });
  });

  it('passes only when focus does nothing', () => {
    expect(focusVerdict(withAct('nothing')).passes).toBe(true);
    expect(focusVerdict(withAct('navigate')).passes).toBe(false);
  });

  it('tabs Name, Email, Send and round again when focus does nothing', () => {
    let s = withAct('nothing');
    const said: string[] = [];
    for (let i = 0; i < 4; i++) {
      s = pressTab(s);
      said.push(focusSaid(s));
    }
    expect(said).toEqual(['Focus on Name.', 'Focus on Email.', 'Focus on Send.', 'Focus on Name.']);
    expect(s.page).toBe('form');
  });

  it('submits the half-filled form when Tab reaches Email', () => {
    const s = pressTab(pressTab(withAct('submit')));
    expect(s.page).toBe('sent');
    expect(s.at).toBe(-1);
    expect(focusSaid(s)).toBe('Focus on Email. The form was sent, with Email still empty.');
  });

  it('opens another page when Tab reaches Email', () => {
    const s = pressTab(pressTab(withAct('navigate')));
    expect(s.page).toBe('elsewhere');
    expect(focusSaid(s)).toBe('Focus on Email. The page changed to shop.example/offers.');
  });

  it('has nothing to focus once the page has changed', () => {
    const s = pressTab(pressTab(pressTab(withAct('navigate'))));
    expect(s.page).toBe('elsewhere');
    expect(focusSaid(s)).toBe('This page has nothing to focus. Press Reset to start again.');
  });

  it('says what a setting does when the reader picks it', () => {
    expect(focusSaid(withAct('nothing'))).toBe('Focusing Email does nothing. Only Send sends.');
    expect(focusSaid(withAct('submit'))).toBe('Focusing Email sends the form.');
    expect(focusSaid(withAct('navigate'))).toBe('Focusing Email opens another page.');
  });
});

describe('the 1.4.13 lab', () => {
  const all = { dismissable: true, hoverable: true, persistent: true };

  it('starts failing all three conditions', () => {
    expect(tipVerdict(TIP_START)).toEqual({ criterion: '1.4.13', passes: false });
    expect(tipSaid(TIP_START)).toBe(
      'Fails: Escape does not close it, it vanishes when the pointer moves into it, it closes on a timer.',
    );
  });

  it('passes only with all three', () => {
    expect(tipVerdict(withConditions(all)).passes).toBe(true);
    expect(tipSaid(withConditions(all))).toBe(
      'Escape closes it, the pointer can move into it, and it stays until dismissed.',
    );
    expect(tipVerdict(withConditions({ ...all, persistent: false })).passes).toBe(false);
    expect(tipSaid(withConditions({ ...all, persistent: false }))).toBe(
      'Fails: it closes on a timer.',
    );
  });

  it('opens on hover', () => {
    const s = tipAct(TIP_START, 'hover');
    expect(s.open).toBe(true);
    expect(s.pointer).toBe('word');
    expect(tipSaid(s)).toBe('The tooltip opens.');
  });

  it('vanishes when the pointer heads for it, unless it is hoverable', () => {
    const lost = tipAct(tipAct(TIP_START, 'hover'), 'into');
    expect(lost.open).toBe(false);
    expect(tipSaid(lost)).toBe('The tooltip vanished as the pointer left the word.');
    const kept = tipAct(tipAct(withConditions({ ...all }), 'hover'), 'into');
    expect(kept.open).toBe(true);
    expect(kept.pointer).toBe('tip');
    expect(tipSaid(kept)).toBe('The pointer is in the tooltip, and it stays open.');
  });

  it('closes on a timer unless it is persistent', () => {
    expect(tipSaid(tipAct(tipAct(TIP_START, 'hover'), 'wait'))).toBe(
      'Five seconds later the tooltip closed by itself.',
    );
    expect(tipSaid(tipAct(tipAct(withConditions(all), 'hover'), 'wait'))).toBe(
      'Five seconds later the tooltip is still open.',
    );
  });

  it('ignores Escape unless it is dismissable', () => {
    expect(tipSaid(tipAct(tipAct(TIP_START, 'hover'), 'escape'))).toBe(
      'Escape did nothing. The tooltip still covers the text.',
    );
    const dismissed = tipAct(tipAct(withConditions(all), 'hover'), 'escape');
    expect(dismissed.open).toBe(false);
    expect(dismissed.pointer).toBe('word');
    expect(tipSaid(dismissed)).toBe('Escape closed the tooltip, and the pointer did not move.');
  });

  it('has nothing to act on while closed', () => {
    expect(tipSaid(tipAct(TIP_START, 'into'))).toBe('There is no tooltip open.');
    expect(tipSaid(tipAct(TIP_START, 'escape'))).toBe('There is no tooltip open.');
    expect(tipSaid(tipAct(TIP_START, 'wait'))).toBe('There is no tooltip open.');
  });
});
