---
title: How to test a page in 15 minutes
description: An order of manual checks for one web page, with a browser, a keyboard and free browser tools, and the WCAG criteria each check covers.
published: 2026-11-28
criteria: [1.1.1, 1.3.1, 1.4.1, 1.4.2, 1.4.3, 1.4.4, 1.4.10, 1.4.11, 2.1.1, 2.1.2, 2.2.2, 2.4.1, 2.4.2, 2.4.3, 2.4.7, 2.4.11, 3.1.1, 3.3.1, 3.3.2, 4.1.2]
---

Fifteen minutes is enough to find the failures that stop most people on a page: a control you
cannot reach with the keyboard, text too faint to read, a layout that breaks when zoomed, a
form field with no label. It is not enough to say a page conforms to WCAG. Conformance covers
the whole page against every criterion at the chosen level, and every page of a process such as
a checkout. Treat what follows as a first pass that tells you where to look harder.

The checks run in an order that saves time. Each step uses what the one before it set up, and
the cheapest checks come first. You need a desktop browser (Chrome or Firefox), a keyboard and
the developer tools built into the browser. Nothing here costs money or needs an account.

## Before you start: one automated scan (2 minutes)

Run an automated scan first, so you do not spend manual time on what a tool finds in seconds.
In Chrome, open DevTools, go to the Lighthouse panel, tick Accessibility only, and run it. In
Firefox, open the Accessibility panel in DevTools and choose "Check for issues", then "All
Issues". Lighthouse weights its accessibility checks by the user impact that axe-core assigns
them, and it reports images with no `alt` attribute, text below the contrast threshold, fields
with no label and a page with no `lang` attribute.

Write the failures down and move on. Do not stop to fix them now. W3C's own advice on tools is
that they can assist an evaluation but cannot determine whether a page is accessible. A scan can
tell you that an image has an `alt` attribute. It cannot tell you whether "image123.jpg" or
"photo" describes the picture. The rest of this post is the part no tool does for you.

## Minute 2: the title, the language, and anything that moves

Look at the browser tab. [2.4.2 Page Titled](/criteria/2.4.2/), Level A, asks for a title that
says what this page is, so "Contact us – Riverside Dental" passes and "Home" on every page of a
site does not. A person with several tabs open, or a screen reader user who hears the title
first, uses it to know where they are.

Then check the language. In DevTools, look at the opening `html` tag in the Elements panel. It
should carry a `lang` attribute that matches the page, such as `lang="en-GB"`. That is
[3.1.1 Language of Page](/criteria/3.1.1/), Level A. Without it, a screen reader may read an
English page with French pronunciation rules, or the other way round.

While the page loads, watch and listen. [1.4.2 Audio Control](/criteria/1.4.2/), Level A,
applies to sound that starts by itself and plays for more than 3 seconds: there has to be a way
to stop it, or to turn it down apart from the computer's own volume. [2.2.2 Pause, Stop,
Hide](/criteria/2.2.2/), Level A, applies to a carousel, a ticker or an animation that starts by
itself and runs for more than 5 seconds next to other content: there has to be a way to pause,
stop or hide it. Content that updates itself, such as a live score, needs that control however
short it is.

## Minutes 3 to 7: put the mouse away

This is the longest step, and it finds the failures that block people completely. Click the
address bar, then press Tab and keep pressing it. Shift+Tab goes back. Watch for five things.

First, where does the first Tab press land? [2.4.1 Bypass Blocks](/criteria/2.4.1/), Level A,
asks for a way past the blocks of links and menus repeated on every page. A "Skip to main
content" link that appears on the first press is the usual way. Headings and landmarks (a
`main` element, a `nav` element) also meet it, so a page with no skip link is not a failure on
its own, but a keyboard user with no skip link has to press Tab through the whole menu on every
page.

The lab below shows the difference. Take the skip link away and count the Tab presses to the
article, then make the menu longer and count again.

::lab{id="skip-link" num="2.4.1"}

Second, can you always see where you are? [2.4.7 Focus Visible](/criteria/2.4.7/), Level AA,
asks for a visible focus indicator on whatever has focus. If you press Tab and lose track of the
focus, even once, write down where. A common cause is a style sheet with `outline: none` and no
replacement.

Third, is the focused item ever hidden? [2.4.11 Focus Not Obscured
(Minimum)](/criteria/2.4.11/), Level AA and new in WCAG 2.2, fails a page where a sticky header,
a sticky footer or a cookie banner covers the focused item entirely. A focused item that is
partly covered passes at this level. A cookie banner is worth testing on its own: leave it open,
Tab past it, and see whether the links underneath vanish behind it as the page scrolls.

Fourth, does the order make sense? [2.4.3 Focus Order](/criteria/2.4.3/), Level A, asks that the
order focus moves in keeps the meaning and the way the page works. Focus should move through
the page in the order you read it, and a dialog that opens should take focus into itself. A
jump from the header to the footer and back to the middle is a failure to note. Firefox draws
the order for you: in the Accessibility panel, tick "Show Tabbing Order", and each focusable
item gets a numbered marker.

Fifth, does everything work? [2.1.1 Keyboard](/criteria/2.1.1/), Level A, asks that everything
a mouse can do, the keyboard can do too. Open each menu, each accordion and each tab with Enter
or Space, and move inside a menu or a set of tabs with the arrow keys. A `div` with a click
handler and no `tabindex` will be skipped by Tab altogether. Then check that you can leave every
part of the page. [2.1.2 No Keyboard Trap](/criteria/2.1.2/), Level A, fails a component that
takes focus and will not give it back, which embedded video players and chat widgets often do.
A modal dialog may hold focus while it is open, as long as Escape or a close button lets you out.

## Minutes 7 to 9: zoom in

Set the browser window to 1280 pixels wide, or as near as your screen allows. Press Ctrl and +
(Cmd and + on a Mac) until the zoom reads 200%. [1.4.4 Resize Text](/criteria/1.4.4/), Level AA,
asks that text can be doubled in size without losing content or function. Look for text cut off
in its box, lines that overlap, and buttons that slide off the screen.

Keep going to 400%. At 400% a 1280-pixel window is 320 CSS pixels wide, the width that
[1.4.10 Reflow](/criteria/1.4.10/), Level AA, names. A page that scrolls vertically should now
fit in one column, with no sideways scrolling to read a line of text. Data tables, maps,
diagrams and video are allowed to need both directions. A navigation bar that stays wide and
pushes the page sideways is not. Zoom back to 100% with Ctrl and 0.

## Minutes 9 to 11: contrast and colour

Your automated scan has already listed text it could measure. Now check what it could not:
text over images or gradients, placeholder text, and the edges of controls.

In Chrome DevTools, click the Inspect arrow and hover over any text: the tooltip shows its
contrast ratio, with a warning sign if it fails. Open the colour picker on the text's `color`
value to see the ratio against the AA and AAA lines. The CSS Overview panel lists every pair of
colours on the page with low contrast. For colours you want to try before you change them, this
site's [colour check](/colour-check/) does the same sum.

[1.4.3 Contrast (Minimum)](/criteria/1.4.3/), Level AA, asks for 4.5:1 for ordinary text and
3:1 for large text, which is at least 18 point (about 24 CSS pixels), or 14 point (about 18.5
CSS pixels) in bold. A worked case: grey `#8a8a8a` on white measures 3.45:1. As body text it
fails, and as a 24-pixel heading it passes. Darken it to `#767676` and it measures 4.54:1, which
passes at any size. Text in a logo and text on a disabled control are exempt.

[1.4.11 Non-text Contrast](/criteria/1.4.11/), Level AA, asks for 3:1 for the parts of a
control you need to see to use it, such as the border of a text field, the box of a checkbox,
and the focus indicator you watched in the keyboard step. A field border of `#949494` on white
measures 3.03:1 and just passes. The same grey as small text would fail 1.4.3.

Then look at the links inside paragraphs. If the only thing that marks a link is its colour,
[1.4.1 Use of Color](/criteria/1.4.1/), Level A, fails it unless the link colour has at
least 3:1 contrast with the text around it, which W3C's technique G183 accepts. An underline is
the simpler fix, and it works for everyone. In Firefox, the Accessibility panel's "Simulate" menu shows the page without colour, which
makes these cases easy to spot. The same check applies to a required field marked only in red,
and to a chart whose lines differ only in colour.

## Minutes 11 to 13: images and structure

Go back to the images in your scan results and judge each one. [1.1.1 Non-text
Content](/criteria/1.1.1/), Level A, asks that every image that carries meaning has a text
alternative that carries the same meaning, and that a decorative image is hidden from assistive
technology with an empty `alt=""`. In Chrome, hover over an image in the Elements panel to see
its `alt`. In Firefox, right-click the image and choose "Inspect Accessibility Properties" to
see the name a screen reader gets. A chart's alternative should give its finding ("Sales fell by
a third in March"), not only its title. A logo that links home should be named for where it
goes, such as "Riverside Dental home".

Then check that what looks like structure is structure in the markup. [1.3.1 Info and
Relationships](/criteria/1.3.1/), Level A, asks that headings, lists and tables are marked up as
headings, lists and tables, so a screen reader can announce them and jump between them. In the
Firefox Accessibility panel, or the Accessibility pane of Chrome's Elements panel, select the
text that looks like a section heading: its role should be "heading" with a level. Bold text in
a large font with any other role, such as "paragraph", is a failure to note.
Check that the heading levels follow the page's outline, with one `h1` at the top.

## Minutes 13 to 15: one form

If the page has a form, fill it in. [3.3.2 Labels or Instructions](/criteria/3.3.2/), Level A,
asks for a visible label on each field, and any rule about the answer (a date format, a password
length) before the reader types. A placeholder that disappears on the first key press is not a
label. Click each label: if the cursor moves into the field, the label is tied to it in the
markup.

Then submit the form with the required fields empty. [3.3.1 Error Identification](/criteria/3.3.1/),
Level A, asks that the form says in text which field is wrong and what is wrong with it. A red
border alone fails, and so does a banner that says "There was a problem" without naming the field.

Last, select one custom control, such as a toggle or a dropdown built from `div` elements, in
the Accessibility panel. [4.1.2 Name, Role, Value](/criteria/4.1.2/), Level A, asks that it
exposes a name, what kind of control it is, and its current state, such as "Dark mode, switch,
on". The 4.1.2 page on this site has a step-by-step "How to test" section for this check, and
more criterion pages will carry one as they are written.

## What the 15 minutes leave out

This pass covers 20 of the 55 Level A and AA criteria in WCAG 2.2, and some only in part. It does
not cover captions and audio description for video, time limits, the meaning of link text, or
how the page behaves with a screen reader from start to finish. For a page you are about to
publish, the next step is a screen reader pass with NVDA on Windows or VoiceOver on a Mac, and
then each remaining criterion from the [list of all criteria](/criteria/).

Run the 15 minutes on every new template and on every page that changes its layout. The list of
failures you wrote down is the start of a fix list, and each item on it links to the criterion
page that explains the fix.

## Sources

- [Easy Checks – A First Review of Web Accessibility](https://www.w3.org/WAI/test-evaluate/preliminary/), W3C
- [Selecting Web Accessibility Evaluation Tools](https://www.w3.org/WAI/test-evaluate/tools/selecting/), W3C
- [Web Content Accessibility Guidelines (WCAG) 2.2, Conformance](https://www.w3.org/TR/WCAG22/#conformance), W3C
- [Understanding Audio Control](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html), W3C
- [Understanding Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html), W3C
- [Understanding Bypass Blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html), W3C
- [Understanding Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), W3C
- [Understanding No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html), W3C
- [Understanding Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), W3C
- [Understanding Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), W3C
- [Understanding Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), W3C
- [Understanding Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), W3C
- [Technique G183: Using a contrast ratio of at least 3:1 to distinguish inline text links from surrounding text](https://www.w3.org/WAI/WCAG22/Techniques/general/G183), W3C
- [Lighthouse accessibility scoring](https://developer.chrome.com/docs/lighthouse/accessibility/scoring), Chrome for Developers, Google
- [Discover and fix low contrast text with Chrome DevTools](https://developer.chrome.com/docs/devtools/accessibility/contrast), Chrome for Developers, Google
- [Accessibility Inspector](https://firefox-source-docs.mozilla.org/devtools-user/accessibility_inspector/), Firefox Source Docs, Mozilla
