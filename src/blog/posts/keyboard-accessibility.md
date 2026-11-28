---
title: "Keyboard accessibility: reach it, leave it, see it"
description: The WCAG 2.2 criteria a keyboard user meets on every page, from reaching each control to seeing where focus is, with a check you can run with the Tab key.
published: 2026-11-28
criteria: [2.1.1, 2.1.2, 2.4.3, 2.4.7, 2.4.11, 1.4.11]
---

Put the mouse out of reach and press Tab. The questions a keyboard user asks on every page
follow from there. Can I reach every control? Can I leave each one again? Does focus move in a
sensible order? Can I see where it is? Is it hidden behind something? Each question is a
separate WCAG criterion, and a page has to answer all of them before a keyboard user can finish
a task on it.

The people asking are not only people without a mouse. A screen reader is driven from the
keyboard. Speech input, switch devices and on-screen keyboards send keystrokes to the page. So
does a person with a tremor who cannot hold a pointer still. A page that fails here fails for
all of them at once.

This post takes the criteria in the order a person meets them, and links each to its own page
for the detail.

## Every control, from the keyboard

[2.1.1 Keyboard](/criteria/2.1.1/), Level A, asks that everything the page does can be done
from a keyboard. That covers buttons and links, and also menus, sliders, sortable tables, drag
and drop, and any custom widget. The keyboard route does not have to be the same as the mouse
route. A list you reorder by dragging can pass with "Move up" and "Move down" buttons beside
each item. What matters is that the result can be reached.

There is one exception. A function that depends on the path of a movement, not only where it
starts and ends, is exempt. Freehand drawing and a watercolour brush are the examples W3C gives.
Dragging a file onto a folder is not exempt, because only the two end points matter, so a
keyboard user needs another way to do it. The stricter
[2.1.3 Keyboard (No Exception)](https://www.w3.org/WAI/WCAG22/Understanding/keyboard-no-exception.html),
Level AAA, removes even that exception.

2.1.1 also rules out keyboard routes that depend on timing. A control that only works if you
press a key three times within half a second, or hold it down for two seconds, is not operable
for many of the people who rely on the keyboard. Mouse input stays allowed: the criterion adds a
route, it takes none away.

The most common failure is a `div` or `span` styled to look like a button. It works with a
mouse, so it looks finished. It takes no focus, Enter and Space do nothing, and a screen reader
reads it as text. Try it below with "Press Tab".

::example{num="2.1.1"}

The fix is the element HTML already has:

```html
<!-- Broken: no focus, no key handling, no role -->
<div class="btn" onclick="addToBasket()">Add to basket</div>

<!-- Fixed -->
<button type="button" class="btn" onclick="addToBasket()">Add to basket</button>
```

A `button` takes focus, fires on Enter and on Space, and is announced as a button. A `div` can
be made to do the same with `role="button"`, `tabindex="0"` and handlers for both keys, but each
of those is something to get wrong. MDN's advice on `tabindex` says the same: use an
interactive element instead of adding focus to one that is not.

## Getting out again

[2.1.2 No Keyboard Trap](/criteria/2.1.2/), Level A, asks that if focus can move into a part of
the page, it can move out using the keyboard alone. A trap is worse than a missing control. A
keyboard user who cannot leave a component cannot reach anything else on the page, and often
has to close the tab.

Traps usually come from embedded content and hand-built widgets: a video player that keeps Tab
for its own controls, a rich text editor that inserts a tab character, a map that takes the
arrow keys and never gives them back. A modal dialog is allowed to keep focus inside it while it
is open. That is the correct behaviour, as long as there is a way out. If the way out uses
anything other than Tab, the arrow keys or Escape, the page has to tell the user which key to
press.

2.1.2 is one of four criteria that WCAG applies to all content on a page, including parts that
are not relied on to meet any other criterion. A trap in an advertisement or a third-party
widget still fails the page, because it stops the user reaching everything else.

In the lab below, the newsletter dialog loops focus between its field and its button and binds
no key to close it. Tab through it, then switch on an exit and try again.

::lab{id="keyboard-trap" num="2.1.2"}

The simplest trap with an exit is the native `dialog` element opened with `showModal()`. The
browser closes it on Escape, makes the page behind it inert, and moves focus into it when it
opens.

## An order that makes sense

[2.4.3 Focus Order](/criteria/2.4.3/), Level A, asks that when focus moves through the page in
sequence, the order keeps the meaning and the operation intact. There can be more than one
order that passes. A table can be read row by row or column by column. What fails is an order
that a person cannot follow: focus that jumps from a name field to a checkbox at the bottom of
the form and back to the address.

Two causes account for most failures. The first is a positive `tabindex`. An element with
`tabindex="1"` is reached before everything with `0` or none, wherever it sits on the page, so
one positive value reorders the whole page around it. Use only `0` and `-1`, and put the HTML
in the order you want. The second is CSS that moves things on screen without moving them in the
source, such as flexbox `order` or a grid placement. The source order is the order Tab follows.

The other common failure is a dialog or menu that opens far away from its trigger in the focus
order. When a modal dialog opens, focus has to go into it, the page behind it has to be out of
reach, and when it closes focus has to return to the button that opened it. A non-modal panel,
such as a disclosure or a filter drawer, belongs straight after its trigger in the source, so
the next Tab press lands in it.

## Seeing where focus is

[2.4.7 Focus Visible](/criteria/2.4.7/), Level AA, asks that the keyboard focus indicator is
visible. Without it, a sighted keyboard user is pressing Tab with no idea what Enter will
activate. The usual cause is one line of CSS:

```css
/* Removes the ring for everyone, keyboard users included */
button:focus { outline: none; }

/* Replaces it: shown for keyboard focus, hidden on most mouse clicks */
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

The browser's own focus ring passes 2.4.7. Removing it with nothing in its place fails, and W3C
lists that as a common failure. If the ring looks wrong when someone clicks a button with the
mouse, `:focus-visible` is the answer. Browsers match it when they judge the user needs to see
focus, which in practice means keyboard focus and any text field. Every current major browser
supports it.

2.4.7 sets no size or colour for the indicator. W3C's guidance points to
[1.4.11 Non-text Contrast](/criteria/1.4.11/), Level AA, for that: a focus indicator is
usually a visual part of a control, so it needs 3:1 against the colours next to it. The ring in
the code above, `#1d4ed8`, measures 6.7:1 against a white page. Drawn directly on the edge of a
dark navy button (`#1e3a8a`), it measures 1.55:1 and disappears into the button. The
`outline-offset` of 2px moves the ring off the button and onto the white page, which is why it
is there.

In the lab below you style a focus ring yourself and see when it passes and when it fails.

::lab{id="focus-ring" num="2.4.7"}

WCAG 2.2 added a stricter test for the indicator itself,
[2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html),
Level AAA. It asks for an indicator at least as large as a 2px solid outline around the
control, and a change of at least 3:1 between the focused and unfocused colours of the same
pixels. That compares a state with a state, where 1.4.11 compares a colour with its neighbour.
It does not apply when the browser draws its default ring on an unchanged background. A solid
outline of 2px or more, in a colour with 3:1 against the page, passes in almost every case. It
is not required at Level AA, but it is the clearest target to design to.

## Focus not hidden behind something

[2.4.11 Focus Not Obscured (Minimum)](/criteria/2.4.11/), Level AA and new in WCAG 2.2, asks
that the focused control is not entirely hidden by content the author placed on the page.
Partly covered passes this criterion, though the more is hidden the harder it is to see. Its
Level AAA partner, 2.4.12 Focus Not Obscured (Enhanced), asks that no part is hidden.

The usual cause is a sticky header, a sticky footer or a cookie banner. A keyboard user tabs
down the page, the browser scrolls the next link into view, and it lands under a header that
stays fixed at the top. Focus is on the link, but nobody can see it.

CSS has a one-line fix, and it is a W3C technique for this criterion. `scroll-padding` tells the
browser how much of the edge of the viewport is taken, so it scrolls focused elements clear of
it:

```css
html {
  scroll-padding-top: 5.5rem;     /* the height of the sticky header */
  scroll-padding-bottom: 4rem;    /* the height of a sticky cookie banner */
}
```

Content that the user opens and that closes when focus moves on, such as a menu, a tooltip or a
date picker, does not count against 2.4.11. A chat window that stays open does count, unless the
user can uncover the focused control without moving focus back, by pressing Escape for example.
A modal dialog passes, because focus moves into it.

## A check you can run with the Tab key

These steps need only a browser. Put the mouse aside before you start.

1. Click the address bar, then press Tab. The first stop should be a skip link or the first
   control at the top of the page, and you should see a focus indicator on it.
2. Keep pressing Tab to the end of the page. Each stop should show a clear indicator, and none
   should land under a sticky header, footer or banner.
3. Watch the order. Focus should move through the page the way you would read it, without jumps
   backwards or across to unrelated parts.
4. Operate every control: Enter on links and buttons, Space on buttons and checkboxes, the
   arrow keys in menus, radio groups, sliders and tabs. Each should do what a click does.
5. Open each dialog, menu and drawer. Focus should move into it, Tab should stay inside a modal,
   and Escape should close it and put focus back on its trigger.
6. Tab into every embedded player, map or editor, then Tab or Escape out. If you cannot leave,
   that is a 2.1.2 failure, unless the page tells you which key to press.
7. Press Shift and Tab back up the page. You should pass the same controls in reverse.

## Sources

- [Understanding Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html), W3C
- [Understanding Keyboard (No Exception)](https://www.w3.org/WAI/WCAG22/Understanding/keyboard-no-exception.html), W3C
- [Understanding No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html), W3C
- [WCAG 2.2, Conformance requirement 5: Non-Interference](https://www.w3.org/TR/WCAG22/#cc5), W3C
- [Understanding Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), W3C
- [Understanding Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html), W3C
- [Understanding Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html), W3C
- [Understanding Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), W3C
- [C43: Using CSS scroll-padding to un-obscure content](https://www.w3.org/WAI/WCAG22/Techniques/css/C43), W3C
- [What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/), W3C
- [:focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible), MDN, Mozilla
- [HTML attribute: tabindex](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/tabindex), MDN, Mozilla
- [The dialog element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog), MDN, Mozilla
