import { createContext, useContext } from 'react';
import { rel, type Route } from './routes';

const RouteContext = createContext<Route | null>(null);

export const RouteProvider = RouteContext.Provider;

/** The route being rendered, and `href(path)` for a relative link from it to any site path. */
export function useRoute(): { route: Route; href: (to: string) => string } {
  const route = useContext(RouteContext);
  if (!route) throw new Error('useRoute() outside <Site>');
  return { route, href: (to) => rel(route.path, to) };
}
