---
title: "Colour contrast beyond text: 1.4.3, 1.4.11 and 1.4.1"
description: Text needs 4.5:1, controls and graphics need 3:1, and colour can never carry meaning alone. How the three criteria fit together, with measured colour pairs.
published: 2026-11-28
criteria: [1.4.1, 1.4.3, 1.4.11]
---

Most contrast checks stop at the text. A designer picks a grey for body copy, a contrast checker
says 4.6:1, and the page is called done. But the same page has field borders, checkboxes, focus
rings, icons, chart lines and red error states, and two more criteria cover those. All three sit
in guideline 1.4, Distinguishable:

- [1.4.3 Contrast (Minimum)](/criteria/1.4.3/), Level AA, sets a threshold for text.
- [1.4.11 Non-text Contrast](/criteria/1.4.11/), Level AA since WCAG 2.1, sets one for the parts
  of controls and graphics a person needs to see.
- [1.4.1 Use of Color](/criteria/1.4.1/), Level A, says colour can never be the only way a piece
  of information reaches the reader.

A design can pass any one of them and fail the other two. This post takes them in turn, then
shows where they meet on one ordinary form.

## What a contrast ratio measures

A contrast ratio compares how light two colours are. It runs from 1:1, the same colour twice,
to 21:1, black on white. Hue plays no part: a red and a green can have almost the same ratio
against white and almost none against each other.

WCAG works it out from each colour's relative luminance, a number from 0 for black to 1 for
white. For an sRGB colour you take each of the red, green and blue channels out of 255, convert
it to a linear value, and add them with weights of 0.2126, 0.7152 and 0.0722. Green counts for
most because the eye is most sensitive to it. The ratio is the lighter luminance plus 0.05,
divided by the darker luminance plus 0.05.

A worked case: `#767676` has a relative luminance of 0.1812. White has 1. So the ratio is
1.05 divided by 0.2312, which is 4.54:1. It is the lightest neutral grey that passes for body
text on white.

The result is never rounded up. `#777777` on white measures 4.48:1, which fails 4.5:1, even
though most tools would print it as "4.5". The same goes for the 3:1 threshold: `#949494` on
white measures 3.03:1 and passes, and `#959595` measures 2.995:1 and fails. Read the figure to
two decimal places, or use a tool that gives a verdict.

## Text: 1.4.3 Contrast (Minimum)

1.4.3 asks for 4.5:1 between text and its background, and 3:1 for large text. Large means at
least 18 points, or 14 points in bold. In CSS pixels that is 24px, or about 18.66px bold. A
heading at 20px regular is not large, so it needs 4.5:1 like the body copy.

Three things are caught by 1.4.3 more often than they should be:

- **Placeholder text.** The default placeholder grey in many design kits is near `#a9a9a9`, which
  measures 2.35:1 on white. W3C's guidance says placeholder text is covered if you use it.
- **Text on images.** The ratio has to hold against the part of the image behind the letters,
  so a headline over a photograph of sky and trees can pass on the left and fail on the right.
  Add a solid or semi-opaque panel behind it and measure against that.
- **Hover and focus states.** A link that turns pale grey on hover is text in that state, and it
  needs 4.5:1 too.

Some text is exempt: text in a disabled control, text that is pure decoration, text inside a
photograph that happens to show a sign, and logotypes. W3C's guidance limits the logo exemption
to colours a brand actually fixes. A low-contrast "Sign in" in the site header is not a logo.

The lab below checks one text colour against one background. Type a pair you use, or move the
lightness until the verdict changes, and watch the threshold it crosses.

::lab{id="colour-check" num="1.4.3"}

## Everything else: 1.4.11 Non-text Contrast

1.4.11 asks for 3:1 for two kinds of thing. The first is anything a person needs to see to find
a control or to know its state: the edge of a text field, the box of a checkbox and the tick in
it, the track and handle of a slider, the ring that shows focus. The second is the parts of a
graphic you need to understand it: the lines on a chart, the shape of an icon with no text next
to it.

The 3:1 is measured against the adjacent colour, the one the part sits on or next to. That
means:

- A text field whose border is the only sign it exists needs 3:1 between the border and the page.
  A border of `#cccccc` on white measures 1.61:1 and fails. `#949494` measures 3.03:1 and passes.
- A tick inside a checkbox is measured against the checkbox's own fill, because that is the
  colour next to it.
- A custom focus ring needs 3:1 against what is around it. A light blue ring of `#4c9ffe` on a
  white page measures 2.73:1 and fails. `#0b57d0` measures 6.39:1. W3C's guidance treats the
  browser's own focus style as exempt from the ratio, provided the author has not changed it,
  though it must still be visible.

Not every control needs a visible edge. A button whose label is clear text, such as "Continue",
is identified by that text, so its background does not have to reach 3:1 against the page. The
text itself falls under 1.4.3: white on `#0078d4` measures 4.53:1, which passes, but only just.
W3C still suggests a visible boundary, because it helps people who find it hard to tell what is
clickable.

The exceptions follow the same reasoning as 1.4.3. A disabled control is exempt. So is a graphic
whose look is essential to it, such as a flag, a photograph or a heat map. A chart that prints
each value as text next to its slice or line does not need the slices to reach 3:1, because the
text carries the same information. A hover effect you add on top of a native control does not
need 3:1, since the pointer already shows where it is, but it must not lower the contrast of the
control or of its focus ring.

The lab below fades the edges of a small form. Drag the slider until the fields stop reading as
fields, and note the ratio where 1.4.11 fails.

::lab{id="non-text-contrast" num="1.4.11"}

## When colour is the message: 1.4.1 Use of Color

The first two criteria are about lightness. 1.4.1 is about hue. It fails any design where the
only way to tell two things apart is their colour: a required field marked by a red label, a chart
with a red line and a green line and no other difference, a status shown only as a green or red
dot.

Contrast ratios explain why. An error red of `#d93025` measures 4.77:1 on white, and a success
green of `#188038` measures 5.02:1. Both pass 1.4.3 as text. Against each other they measure
1.05:1, so to someone who cannot tell red from green, or who prints the page in greyscale, the
two are the same colour. The fix is a second cue that is not colour: an icon, a word such as
"Error" or "Saved", a pattern on the chart line, a different shape for the dot.

Links in running text are where 1.4.1 fails most often. A link that is blue and nothing else
depends on colour alone. There are two ways to pass:

- **Underline it**, or give it another cue that does not depend on colour. This is what the site's
  1.4.1 page recommends, and it is the simplest.
- **Make the link colour differ in lightness** from the text around it by at least 3:1, and keep
  both at 4.5:1 against the background. This is W3C's technique G183.

The second route is narrower than it looks. With body text of `#2b2b2b` on white (14.16:1), a
link colour of `#0057b8` passes 1.4.3 easily at 6.87:1, but it is only 2.06:1 against the text,
so without an underline it fails 1.4.1. A lighter blue, `#2f6fe0`, is 3.02:1 against the text
and 4.70:1 against the page, and passes both. There is almost no room between "too close to the
text" and "too pale for the page". An underline removes the problem.

W3C's guidance on 1.4.1 adds one nuance. Two colours that differ in lightness by 3:1 or more
already have a second cue besides hue. That does not help when the meaning depends on knowing
which hue it is, such as green for valid and red for invalid. Then a cue other than colour is
needed whatever the ratio.

The pair below shows links marked by hue alone, then the same links with an underline. Choose
Greyscale in the vision filter under each and see which links you can still find.

::example{num="1.4.1"}

## Where the three meet: one sign-up field

Take a single email field in an error state, on a white page:

- The label "Email" in `#2b2b2b` measures 14.16:1. That is 1.4.3, and it passes.
- The placeholder "you@example.com" in `#a9a9a9` measures 2.35:1. That is 1.4.3 again, and it
  fails. Use `#767676` (4.54:1) or drop the placeholder.
- The field's border in `#cccccc` measures 1.61:1. That is 1.4.11, and it fails if the border is
  all that shows where the field is. Use `#949494` or darker.
- The focus ring in `#4c9ffe` measures 2.73:1. That is 1.4.11, and it fails. Use `#0b57d0`.
- The border turns `#d93025` to show the error, and nothing else changes. The red passes 1.4.11
  at 4.77:1, but the error is shown by colour alone, so it fails 1.4.1. Add an icon and a message
  in text, such as "Enter an email address with an @".
- The message in `#d93025` measures 4.77:1. That is 1.4.3, and it passes.

One field, six colours, three criteria. A check of the text alone would find the placeholder and
miss the border, the focus ring and the colour-only error: the three failures that stop someone
finding the field and seeing what went wrong.

## A check you can run on one page

These steps need a browser and a contrast checker. The colour check on this site works, and so
does the colour picker in Chrome's developer tools, which shows the contrast ratio of the text
you inspect.

1. Pick the lightest text on the page, often a placeholder, a caption or a footer link. Measure
   it against its background. It needs 4.5:1, or 3:1 if it is at least 24px, or 18.66px bold.
2. Find text over an image or a gradient. Measure it against the lightest part behind the
   letters.
3. Find each kind of form control. Measure the edge that shows where it is against the page.
   It needs 3:1, unless the control is identified by its text.
4. Press Tab through the page. Measure each focus ring against the colour next to it. It needs
   3:1 if you have styled it.
5. Take the colour away. In Chrome's developer tools, open the Rendering tab and set "Emulate
   vision deficiencies" to Achromatopsia (no color). Every link, error, required field and chart
   line should still be clear.

## Sources

- [Understanding Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), W3C
- [Understanding Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), W3C
- [Understanding Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), W3C
- [G183: Using a contrast ratio of 3:1 with surrounding text and providing additional visual cues on hover for links or controls where color alone is used to identify them](https://www.w3.org/WAI/WCAG22/Techniques/general/G183), W3C
- [Web Content Accessibility Guidelines (WCAG) 2.2: definitions of contrast ratio, relative luminance and large scale](https://www.w3.org/TR/WCAG22/), W3C
- [What's New in WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-21/), W3C
- [Apply effects to the page: emulate vision deficiencies](https://developer.chrome.com/docs/devtools/rendering/apply-effects), Chrome for Developers, Google
