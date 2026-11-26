import type { AxNode } from '../src/labs/shared/announce';

/**
 * A test-only reader for the well-formed HTML React writes (`renderToStaticMarkup`), into the
 * announcement log's node shape. The unit tests run in Node with no DOM; in the browser the log
 * reads real elements through `fromDom`. Handles tags, quoted attributes, void elements and the
 * entities React escapes. Not a general HTML parser.
 */

const VOID = new Set(['area', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'wbr']);

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#x27': "'", '#39': "'", nbsp: ' ' };
const decode = (s: string) => s.replace(/&(#?\w+);/g, (m, e: string) => ENTITIES[e] ?? m);

export function parseMarkup(html: string): AxNode {
  const root: { tag: string; attrs: Record<string, string>; children: (AxNode | string)[] } = {
    tag: 'body',
    attrs: {},
    children: [],
  };
  const stack = [root];
  const token = /<\/([a-z0-9]+)\s*>|<([a-z0-9]+)((?:\s+[^\s=/>]+(?:="[^"]*")?)*)\s*(\/?)>|([^<]+)/gi;
  for (const m of html.matchAll(token)) {
    const top = stack[stack.length - 1]!;
    if (m[1]) {
      if (stack.length > 1) stack.pop();
    } else if (m[2]) {
      const attrs: Record<string, string> = {};
      for (const a of (m[3] ?? '').matchAll(/([^\s=/>]+)(?:="([^"]*)")?/g)) {
        attrs[a[1]!] = decode(a[2] ?? '');
      }
      const tag = m[2].toLowerCase();
      const node = { tag, attrs, children: [] as (AxNode | string)[] };
      if (tag === 'input' && 'checked' in attrs) Object.assign(node, { checked: true });
      top.children.push(node);
      if (!m[4] && !VOID.has(tag)) stack.push(node);
    } else if (m[5]) {
      top.children.push(decode(m[5]));
    }
  }
  return root;
}
