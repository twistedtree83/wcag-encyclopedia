import { createElement, Fragment, type ReactNode } from 'react';
import { useRoute } from '../site/RouteContext';
import type { PostNode } from './post';

/**
 * Draws a post body, the tree `parse.ts` made at build time, as React elements. No Markdown is
 * read here: the browser gets the tree as data and this walks it. A link to a page of the site
 * (`to`) becomes a relative href from the page it is on, or, given `link`, whatever `link`
 * makes of it: the feed (`feed.tsx`) passes `absoluteUrl`, since a feed reader is on no page.
 */
export function PostBody({ nodes, link }: { nodes: readonly PostNode[]; link?: (to: string) => string }) {
  const { href: relative } = useRoute();
  const href = link ?? relative;
  const draw = (list: readonly PostNode[]): ReactNode[] =>
    list.map((node, i) => {
      if (typeof node === 'string') return <Fragment key={i}>{node}</Fragment>;
      const { tag, children, to, start } = node;
      const props = {
        key: i,
        ...(tag === 'a' ? { href: to !== undefined ? href(to) : node.href } : {}),
        ...(start !== undefined ? { start } : {}),
      };
      return tag === 'br' || tag === 'hr' ? createElement(tag, props) : createElement(tag, props, ...draw(children));
    });
  return <>{draw(nodes)}</>;
}
