/** Establishes the fail/pass convention before the reader meets their first card. */
export function HowToRead() {
  return (
    <section className="howto" aria-labelledby="howto-heading">
      <h2 id="howto-heading" className="section-eyebrow">
        How to read a card
      </h2>
      <div className="howto__grid">
        <p>
          <strong>Number and level.</strong> Criterion numbers are set in tabular monospace so
          they align down the page. Badges differ in shape, glyph, and label — never hue alone.
        </p>
        <p>
          <strong>Fail, then pass.</strong> The left frame is marked <code>✕ FAIL</code>, the
          right <code>✓ PASS</code>. A caption under each names the one thing that changed.
        </p>
        <p>
          <strong>Evidence.</strong> Where the point is code, a markup diff sits beneath the
          visual. Where the point is perceptual, the visual carries it alone.
        </p>
      </div>
    </section>
  );
}
