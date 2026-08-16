/**
 * The claim, stated plainly so a reader can check it rather than take it on faith.
 *
 * Every line here is enforced by something in the gate: the contrast lines by the token audit,
 * the focus and landmark lines by the axe scan, the 320px line by an explicit overflow check.
 * If a line stops being true, the build goes red.
 */
const RULES = [
  'Body text at or above 4.5:1, UI and large text at or above 3:1, in both themes.',
  'Focus rings on every interactive element, never removed.',
  'Skip link first in the tab order; landmarks and unskipped heading levels.',
  'Nothing carried by hue alone: badges differ in shape, glyph, and label.',
  'Full behaviour at 320px and 200% zoom, with no horizontal scrolling.',
  'Motion respects prefers-reduced-motion.',
];

export function ObeysItsOwnRules() {
  return (
    <section className="rules" aria-labelledby="rules-heading">
      <h2 id="rules-heading" className="section-eyebrow">
        This page obeys its own rules
      </h2>
      <ul className="rules__list">
        {RULES.map((rule) => (
          <li key={rule}>
            <span aria-hidden="true" className="rules__tick">
              ✓
            </span>
            {rule}
          </li>
        ))}
      </ul>
    </section>
  );
}
