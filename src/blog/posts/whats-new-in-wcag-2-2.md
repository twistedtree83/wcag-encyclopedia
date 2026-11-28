---
title: What's new in WCAG 2.2, and why 4.1.1 Parsing went
description: The six new Level A and AA criteria in WCAG 2.2, what each asks of a page and how to check it, and why 4.1.1 Parsing was removed.
published: 2026-11-28
criteria: [2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8, 1.3.1, 4.1.2]
---

WCAG 2.2 became a W3C Recommendation on 5 October 2023, and the current edition is dated
12 December 2024. It adds nine criteria to WCAG 2.1 and removes one, 4.1.1 Parsing. Six of the
nine new criteria are at Level A or AA, the levels that laws and contracts usually name, and
those six are what this post covers.

Everything else carries over. The WCAG 2.2 introduction says that content which conforms to 2.2
also conforms to 2.0 and 2.1. If your site meets 2.1 AA today, moving to 2.2 AA means doing the
six checks below and nothing else.

## The six criteria at a glance

- [2.4.11 Focus Not Obscured (Minimum)](/criteria/2.4.11/), Level AA: a control that has
  keyboard focus is never completely covered by something the page drew over it.
- [2.5.7 Dragging Movements](/criteria/2.5.7/), Level AA: anything you can do by dragging, you
  can also do with single clicks or taps.
- [2.5.8 Target Size (Minimum)](/criteria/2.5.8/), Level AA: anything you click or tap is at
  least 24 by 24 CSS pixels, or has enough space around it to count as that size.
- [3.2.6 Consistent Help](/criteria/3.2.6/), Level A: help that appears on several pages comes
  in the same order relative to the rest of each page.
- [3.3.7 Redundant Entry](/criteria/3.3.7/), Level A: a process does not make you type the same
  information twice.
- [3.3.8 Accessible Authentication (Minimum)](/criteria/3.3.8/), Level AA: signing in does not
  depend on remembering, transcribing or solving something unless the page gives you a way
  round it.

The other three are at Level AAA:
[2.4.12 Focus Not Obscured (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html),
[2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) and
[3.3.9 Accessible Authentication (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-enhanced.html).
This site documents Level A and AA only, so those links go to W3C's own explanations.

## Focus hidden under a sticky header: 2.4.11

The usual failure is a sticky header, a sticky footer or a cookie banner. You press Tab, the
browser scrolls the next field into view, and the field lands under the header. Focus is on the
field, but you cannot see it, so you cannot tell where you are typing.

2.4.11 fails only when the focused item is hidden entirely. A field that is half covered passes
at AA; 2.4.12 at AAA asks that no part of it is covered. Content you opened yourself, such as a
menu, may cover the focused item as long as you can close it without moving focus, for example
with Escape.

For sticky headers, W3C documents one fix: CSS `scroll-padding` on the scrolling element, set
to at least the header's height. The browser then stops scrolling short of the strip the header
covers. A cookie banner can pass by being modal, so you deal with it before you tab on, or by
closing when it loses focus.

To check it, tab through the whole page at the window sizes you test at, with every banner left
open. At each stop, find the focus indicator. If any stop disappears under something the page
drew, 2.4.11 fails.

::lab{id="sticky-banner" num="2.4.11"}

## A route that needs no dragging: 2.5.7

Dragging means pressing, holding and moving along a path before you let go. That is hard with a
tremor, and slow with a head pointer or an eye-gaze system. The common failures are a list you
can only reorder by drag and drop, a slider whose handle moves only while held, and a task board
whose cards move between columns only by drag.

2.5.7 does not ask you to remove dragging. It asks for a second way to reach the same result
with single pointer actions: up and down buttons on each list row, a slider track you can click
at any point, a "Move to" menu on each card, arrow buttons on a map. Dragging is allowed alone
only where it is essential to the function, or where the browser provides the drag and the page
has not changed it.

Keyboard support does not meet it on its own. W3C's explanation of 2.5.7 says it and the
keyboard criteria are judged separately. Arrow keys that move a list item help someone on a
keyboard, but someone with a tremor using a mouse still needs something to click.

To check it, find every drag on the page. For each, try to reach the same end state with clicks
or taps only, never moving the pointer while the button is down.

## Targets of 24 by 24 pixels: 2.5.8

Small icon buttons packed together are the usual failure: a row of 16-pixel icons with a few
pixels between them, where one of them deletes something. 2.5.8 sets a floor of 24 by 24 CSS
pixels for each target. The stricter
[2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html),
from WCAG 2.1 at Level AAA, asks for 44 by 44.

A smaller target still passes under any one of five exceptions:

1. **Spacing.** Draw a circle 24 pixels across, centred on the small target. It passes if that
   circle touches no other target and no other small target's circle.
2. **Equivalent.** The same action is available from another control on the page that meets
   the size.
3. **Inline.** The target sits in a sentence, or its height is set by the line height of the
   text around it. Links in a paragraph are exempt.
4. **User agent control.** The browser sets the size and the page has not changed it.
5. **Essential.** That size or layout is essential, or the law requires it.

A worked case for spacing: three 16-pixel icons with 4 pixels between them have centres 20
pixels apart. Their circles have a radius of 12 pixels, so neighbouring circles overlap and the
row fails. Widen each gap to 8 pixels and the centres are 24 pixels apart: the circles just
meet without crossing, and the row passes with no icon made bigger. Padding each icon's button
out to 24 by 24 passes too, and the drawn icon can stay at 16 pixels.

To check it, inspect each small control in the browser's developer tools and read its box size.
For any under 24 pixels in either direction, measure the distance from its centre to each
neighbour's centre.

::example{num="2.5.8"}

## Help in the same place: 3.2.6

3.2.6 counts four kinds of help: human contact details, such as a phone number or an email
address; a human contact mechanism, such as a chat with a person; a self-help option, such as a
help page; and a fully automated contact mechanism, such as a chatbot. If any of them repeats
across a set of pages, it has to come in the same order relative to the other shared content on
each page.

Order here means the order in the page's markup, not its position in pixels. A help link that is
last in the header on one page and in a floating bubble on the next fails. A layout that moves
the link at a narrow window passes, because the reader caused that change by resizing or
zooming.

3.2.6 does not require you to offer help. A site with none passes. It only stops help that
exists from moving around.

To check it, open three pages from the same task, such as a product page, the basket and the
checkout. List the help items on each, with the shared content just before and just after each
one. The sequence should match on every page.

## Typed once per process: 3.3.7

A checkout asks for a delivery address in step 2, then shows an empty billing address form in
step 4. You have to remember the address and type it again, which costs time with a switch and
memory with a cognitive disability, and the site already has the answer.

3.3.7 asks for one of two fixes. Carry the value forward, filled in and editable, or offer it
for selection, such as a "Same as delivery address" checkbox or a list of the values entered
earlier. Browser autofill does not count, because the criterion asks the site to offer the
value. Re-entry is still allowed in three cases: where it is essential (a memory game), where
security needs it (typing a new password twice), or where the earlier value is no longer valid.

A process ends when the session ends. The criterion does not ask you to store anything between
visits.

To check it, go through each process with more than one step and write down every value you
type. Any value asked for a second time, without being shown back to you or offered to pick,
fails.

## Signing in without a memory test: 3.3.8

3.3.8 is about cognitive function tests: remembering a password, typing in a code, solving a
puzzle. Typing your name, email address or phone number is not one. A sign-in step may use a
cognitive function test only if one of these holds:

- Another way to sign in needs no such test.
- The page helps you through it, for example by letting a password manager fill the field or
  letting you paste.
- The test is recognising objects, such as choosing every picture with a bus.
- The test is recognising a picture or other non-text content you gave the site yourself.

So a password field that blocks paste fails, because it forces you to retype what your password
manager holds. A one-time code split across six one-digit boxes that will not take a pasted code
fails for the same reason. An email link, a passkey or other WebAuthn sign-in that uses the
device's fingerprint, face or PIN, and a labelled field that accepts paste and autofill all
pass. At AAA, 3.3.9 removes the two recognition cases, so an image puzzle no longer passes.

To check it, try each sign-in step with a password manager: let it fill the field, then paste
the password in by hand. Paste a one-time code into the code field. If a puzzle appears, look for
another route that skips it.

## Why 4.1.1 Parsing was removed

4.1.1 asked for markup with complete start and end tags, elements nested correctly, no attribute
given twice and every `id` unique. It dates from screen readers that read the HTML themselves.
Today they read the page through the browser, and the HTML standard defines how a browser
recovers from errors, so the same broken markup gives the same result in every browser. W3C
judged that 4.1.1 was no longer needed for accessibility and marked it obsolete and removed in
2.2. It also added a note to 2.1 in September 2023, and an erratum to 2.0, saying that content
in HTML or XML should be treated as meeting 4.1.1 in those versions too.

The real harm that broken markup can do is still a failure, under other criteria. A duplicate
`id` that points a label at the wrong field leaves the right field with no name, which fails
[4.1.2 Name, Role, Value](/criteria/4.1.2/). A list or table broken so badly that it no longer
reads as a list or table fails [1.3.1 Info and Relationships](/criteria/1.3.1/). Test what the
markup does to the accessibility tree, not whether it passes a validator.

One caution: the WCAG 2.2 introduction notes that a policy which names 2.0 or 2.1 may still
require 4.1.1 to be tested and reported. If your contract or law names an older version, read
what it asks.

## Moving a 2.1 audit to 2.2

An audit against 2.1 AA becomes an audit against 2.2 AA in three steps:

1. Add the six checks above. They need a keyboard, a mouse, a password manager and the
   browser's developer tools, and nothing else.
2. Drop 4.1.1 from the report, unless a policy that names 2.0 or 2.1 still requires it.
3. Keep testing 1.3.1 and 4.1.2 against the accessibility tree, which is where any harm from
   broken markup now shows.

## Sources

- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), W3C
- [What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/), W3C
- [WCAG 2 FAQ](https://www.w3.org/WAI/standards-guidelines/wcag/faq/), W3C
- [Understanding Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), W3C
- [Understanding Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html), W3C
- [Understanding Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), W3C
- [Understanding Consistent Help](https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html), W3C
- [Understanding Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html), W3C
- [Understanding Accessible Authentication (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html), W3C
- [Understanding Parsing](https://www.w3.org/WAI/WCAG22/Understanding/parsing.html), W3C
