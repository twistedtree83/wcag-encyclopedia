---
title: Two contrast thresholds, for text and for everything else
description: How the contrast of text and of borders, icons and focus rings is measured the same way but held to different thresholds.
published: 2026-11-02
updated: 2026-11-20
criteria: [1.4.3, 1.4.11]
---

Text and the parts of a control are measured with the same contrast ratio, but
[Contrast (Minimum)](/criteria/1.4.3/) and [Non-text Contrast](/criteria/1.4.11/)
ask for different amounts of it.

## Two thresholds, one formula

Body text needs **4.5:1** against its background. A field border or an icon needs *3:1*.

### Where the line falls

- A border the reader must see to find the field
- An icon that is the only label of a button

1. Measure the colours.
2. Compare them with `4.5:1` or `3:1`.

> The ratio runs from 1:1, no difference, to 21:1, black on white.

```css
.field { border-color: #767676; }
```

## Sources

- [Understanding Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), W3C
