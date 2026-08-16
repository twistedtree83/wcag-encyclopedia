## Parent

#1

## What to build

The mechanism all nine demos are built on, proven against one of them. This is the
highest-leverage module in the project: get it right and eight of the nine remaining demos are
content authoring; get it wrong and scrubbing, reduced-motion, and caption sync each become a
separate problem solved nine times.

A demo is authored as a **declarative timeline** — an ordered list of keyframes, each carrying a
timestamp, a visual state, and a caption. The runtime is a pure function of time:

```
frameAt(timeline, t) → { state, caption }

timeline: [ { t: 0,   focus: '#name',  caption: 'Tab moves to the name field' },
            { t: 1.4, focus: '#card',  caption: 'Focus ring follows to card number' },
            … ]
scrub input → setT(4.2) → frameAt(timeline, 4.2) → render
```

Everything else reduces to this. **Pause** is "stop advancing `t`". **Scrub** is "set `t`
directly". **Loop** is "`t` modulo duration". **Reduced motion** is "do not auto-advance; the
scrub bar still works". Captions come from the same structure that drives the visuals, so they
cannot desynchronise.

Because there is no human review gate on this issue, the acceptance criteria below pin the
interface contract. An implementation where playback is imperative — where pausing or scrubbing
is a separate code path from rendering a frame — does not satisfy them, even if it looks correct
on screen.

The player shell is the 16:9 chrome-less browser mock, the caption line, and the transport row:
play/pause, a scrub range input with a visually-hidden label, an elapsed/total readout, and a CC
indicator. One player, nine timelines.

Prove it on **1.4.10 Reflow** — a layout going from 1280px to 320px — which the design file
already composes in full.

## Acceptance criteria

- [ ] `frameAt` is pure: same timeline and same `t` always yield the same frame, with no reads of clock or DOM
- [ ] Rendering a frame is the *only* path to the screen — pause, scrub, and loop all work by changing `t`, not by a separate code path
- [ ] Captions are derived from the same keyframes as the visual state, not stored separately
- [ ] Unit tests cover: the caption at a given `t` is the one whose keyframe is in effect; `t` clamps at both ends; looping wraps correctly
- [ ] Play and pause work, and the button's accessible name states the action
- [ ] Scrubbing to any position renders that position's frame and caption
- [ ] The scrub input has a visually-hidden label and is keyboard operable
- [ ] Elapsed and total time are shown numerically in tabular figures
- [ ] Demos are silent and loop by default, with captions on by default
- [ ] Under `prefers-reduced-motion` the demo does not auto-play, and the scrub bar still works
- [ ] All transport controls are at least 44px and keyboard reachable
- [ ] The demo renders in both themes and stays sharp at 400% zoom
- [ ] The 1.4.10 reflow demo plays, matching the composed design
- [ ] The axe scan passes on a page containing a demo

## Blocked by

- #2 — Walking skeleton: build, token palettes, one criterion card, contrast audit, CI
