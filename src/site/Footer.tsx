import { PRINCIPLES } from '../criteria/structure';
import { Brand } from './Brand';
import { useRoute } from './RouteContext';
import { PATHS } from './routes';

/** Logo and one-line description, then the Principles, Tools and About columns. */
export function Footer() {
  const { href } = useRoute();
  const columns = [
    {
      heading: 'Principles',
      links: PRINCIPLES.map((p) => ({ to: href(`${PATHS.criteria}?p=${p.num}`), label: p.name })),
    },
    {
      heading: 'Tools',
      links: [
        { to: href(PATHS.colourCheck), label: 'Colour check' },
        { to: href(PATHS.criteria), label: 'Search criteria' },
        { to: href(`${PATHS.criteria}?new`), label: 'New in 2.2' },
      ],
    },
    {
      heading: 'About',
      links: [
        { to: href(`${PATHS.about}#how-we-test`), label: 'How we test' },
        { to: href(`${PATHS.about}#accessibility-statement`), label: 'Accessibility statement' },
        { to: href(`${PATHS.about}#source-code`), label: 'Source code' },
      ],
    },
  ];

  return (
    <footer className="foot">
      <div>
        <Brand />
        <p>
          Every Level A and AA criterion of WCAG 2.2, explained in plain language and shown
          working and broken.
        </p>
      </div>
      {columns.map(({ heading, links }) => (
        <div key={heading}>
          <h2>{heading}</h2>
          <ul>
            {links.map(({ to, label }) => (
              <li key={label}>
                <a href={to}>{label}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </footer>
  );
}
