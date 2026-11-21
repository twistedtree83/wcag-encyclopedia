import { Brand } from './Brand';
import { ThemeToggle } from './ThemeToggle';
import { useRoute } from './RouteContext';
import { PATHS, type PageKind } from './routes';

/** Which nav item each page sits under. */
const SECTION: Record<PageKind, string> = {
  criterion: PATHS.criteria,
};

const LINKS = [
  { to: PATHS.home, label: 'Home' },
  { to: PATHS.criteria, label: 'Criteria' },
  { to: PATHS.colourCheck, label: 'Colour check' },
  { to: PATHS.about, label: 'About' },
] as const;

/** Logo, main nav (current section marked), and the theme toggle at the end. */
export function Header() {
  const { route, href } = useRoute();
  const section = SECTION[route.page];
  return (
    <header className="top">
      <Brand />
      <nav aria-label="Main">
        <ul>
          {LINKS.map(({ to, label }) => (
            <li key={label}>
              <a href={href(to)} aria-current={to === section ? 'page' : undefined}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <ThemeToggle />
    </header>
  );
}
