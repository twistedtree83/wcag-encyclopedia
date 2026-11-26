import { PRINCIPLES } from '../criteria/structure';
import { Brand } from './Brand';
import { FEEDBACK_FORM_URL } from './config';
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
        { to: FEEDBACK_FORM_URL, label: 'Report a problem with this site' },
      ],
    },
  ];

  return (
    <footer className="foot">
      <div>
        <Brand />
        <p>
          The WCAG 2.2 Level A and AA success criteria, the testable checks a web page has to
          pass, explained in plain language and shown broken and then fixed.
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
