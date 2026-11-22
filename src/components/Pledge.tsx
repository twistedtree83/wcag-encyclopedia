/**
 * The pledge panel (design guide §8.13): an inverted panel with the heading "This site meets
 * the criteria it explains.", a paragraph, and four commitments, each marked with a principle shape.
 *
 * Used in full on the About page's accessibility statement, and by the home page's last
 * section. `level` is the heading level where it sits, so the outline stays in order.
 */

export const COMMITMENTS = [
  {
    mark: 1,
    title: 'Checked on every release',
    body: 'Each page is scanned against WCAG 2.2 AA before deploy. A failure blocks the release.',
  },
  {
    mark: 2,
    title: 'Keyboard first',
    body: 'Every demo works without a mouse, and focus is always visible.',
  },
  {
    mark: 3,
    title: 'Broken examples are labelled',
    body: 'Each failing exhibit is described in text, so a screen reader hears what is wrong instead of the mess itself.',
  },
  {
    mark: 4,
    title: 'Motion is optional',
    body: 'Animations stop when your system asks for reduced motion.',
  },
] as const;

export function Pledge({ level = 2, id }: { level?: 2 | 3; id?: string }) {
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <div className="pledge">
      <div>
        <Heading id={id}>This site meets the criteria it explains.</Heading>
        <p>
          A site about accessibility that fails it would be worse than no site at all. Every
          page is checked before it ships, and the broken examples are fenced off so they
          cannot trip anyone up.
        </p>
      </div>
      <ul>
        {COMMITMENTS.map(({ mark, title, body }) => (
          <li key={title}>
            <span className={`mk p${mark}`} aria-hidden="true" />
            <div>
              <b>{title}</b>
              <span>{body}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
