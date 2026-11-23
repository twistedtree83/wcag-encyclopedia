/**
 * The announcement log's computation (CONTEXT.md, "Announcement log"): from a markup subtree to
 * what a screen reader would say, line by line, in reading order. It is computed from the markup
 * actually rendered, never typed in, so it cannot drift from what it describes.
 *
 * It is a practical, documented subset of the accessible-name and role rules, not the full
 * specification (PRD #40, out of scope):
 *
 *   roles   an ARIA `role` from ROLE_WORDS wins; otherwise the native role of button, a[href],
 *           input (checkbox, radio, range, button types, otherwise edit text), textarea, select,
 *           img (alt="" is decorative and skipped) and h1–h6. Everything else is plain text.
 *   names   aria-labelledby (every id, in order) > aria-label > native: <label for>, a wrapping
 *           <label>, img alt, an input button's value > the content, for the roles named from
 *           content (NAMED_FROM_CONTENT) > title. Content uses an image's alt and skips hidden
 *           parts. Ids resolve within the subtree passed in.
 *   states  pressed (a button with aria-pressed is a "toggle button"), checked (from the input
 *           or aria-checked; a switch says on/off), expanded/collapsed, required, invalid entry,
 *           a heading's level. A state the role does not support is ignored, as screen readers
 *           ignore it.
 *   other   aria-describedby is said last. `lang` marks the language of a part. aria-hidden,
 *           `hidden`, script and style are skipped, except on the root itself: a lab's mock is
 *           hidden from real assistive technology on purpose, and the log reads it anyway.
 *
 * The computation works on `AxNode`, a plain copy of the markup: `fromDom` makes one from a real
 * element in the browser; the unit tests parse React's markup into one.
 */

/** A plain copy of an element: its tag, attributes, live `checked` property and children. */
export type AxNode = {
  readonly tag: string;
  readonly attrs: Readonly<Record<string, string>>;
  /** An input's live checked state (React sets the property, not the attribute). */
  readonly checked?: boolean;
  readonly children: readonly (AxNode | string)[];
};

/** One line of the log. `role` is the word a screen reader says, or `null` for plain text. */
export type Announcement = {
  readonly name: string;
  readonly role: string | null;
  readonly states: readonly string[];
  readonly description: string;
  readonly lang?: string;
};

/** ARIA roles the log knows, and the word said for each. */
const ROLE_WORDS: Readonly<Record<string, string>> = {
  button: 'button',
  link: 'link',
  checkbox: 'checkbox',
  radio: 'radio button',
  switch: 'switch',
  textbox: 'edit text',
  searchbox: 'search edit text',
  combobox: 'combo box',
  slider: 'slider',
  heading: 'heading',
  img: 'image',
  tab: 'tab',
  menuitem: 'menu item',
};

/** Roles whose name comes from their content when nothing else names them. */
const NAMED_FROM_CONTENT = new Set([
  'button',
  'link',
  'checkbox',
  'radio',
  'switch',
  'heading',
  'tab',
  'menuitem',
]);

/** Elements that start a new line of text. Anything else is inline and runs on. */
const INLINE = new Set([
  'a', 'abbr', 'b', 'bdi', 'bdo', 'cite', 'code', 'data', 'em', 'i', 'kbd', 'label', 'mark', 'q',
  's', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var',
]);

const SKIPPED = new Set(['script', 'style', 'template', 'noscript']);

const squash = (s: string) => s.replace(/\s+/g, ' ').trim();

function isHidden(node: AxNode): boolean {
  return node.attrs['aria-hidden'] === 'true' || 'hidden' in node.attrs || SKIPPED.has(node.tag);
}

function nativeRole(node: AxNode): string | null {
  const { tag, attrs } = node;
  if (tag === 'button') return 'button';
  if (tag === 'a') return 'href' in attrs ? 'link' : null;
  if (tag === 'textarea') return 'textbox';
  if (tag === 'select') return 'combobox';
  if (tag === 'img') return attrs.alt === '' ? null : 'img';
  if (/^h[1-6]$/.test(tag)) return 'heading';
  if (tag === 'input') {
    const type = (attrs.type ?? 'text').toLowerCase();
    if (type === 'hidden') return null;
    if (type === 'checkbox') return 'checkbox';
    if (type === 'radio') return 'radio';
    if (type === 'range') return 'slider';
    if (type === 'search') return 'searchbox';
    if (['button', 'submit', 'reset', 'image'].includes(type)) return 'button';
    return 'textbox';
  }
  return null;
}

/** The node's role (an ARIA role name), or `null` when it is plain text or none. */
function roleOf(node: AxNode): string | null {
  const explicit = (node.attrs.role ?? '').trim().split(/\s+/)[0] ?? '';
  if (explicit === 'none' || explicit === 'presentation' || explicit === 'generic') return null;
  if (explicit in ROLE_WORDS) return explicit;
  return nativeRole(node);
}

/** Everything the computation needs to look up across the subtree. */
type Index = {
  readonly byId: ReadonlyMap<string, AxNode>;
  readonly labelsFor: ReadonlyMap<string, AxNode[]>;
  readonly wrappingLabel: ReadonlyMap<AxNode, AxNode>;
};

function indexOf(root: AxNode): Index {
  const byId = new Map<string, AxNode>();
  const labelsFor = new Map<string, AxNode[]>();
  const wrappingLabel = new Map<AxNode, AxNode>();
  const visit = (node: AxNode, label: AxNode | null) => {
    if (node.attrs.id) byId.set(node.attrs.id, node);
    if (node.tag === 'label' && node.attrs.for) {
      labelsFor.set(node.attrs.for, [...(labelsFor.get(node.attrs.for) ?? []), node]);
    }
    if (label && node.tag !== 'label') wrappingLabel.set(node, label);
    const inside = node.tag === 'label' ? node : label;
    for (const c of node.children) if (typeof c !== 'string') visit(c, inside);
  };
  visit(root, null);
  return { byId, labelsFor, wrappingLabel };
}

/** The text of a subtree, as a name: images by their alt, hidden parts and fields skipped. */
function textOf(node: AxNode, skip?: AxNode): string {
  const parts: string[] = [];
  for (const c of node.children) {
    if (typeof c === 'string') parts.push(c);
    else if (c === skip || isHidden(c)) continue;
    else if (c.tag === 'img') parts.push(c.attrs.alt ?? '');
    else if (c.attrs['aria-label']) parts.push(c.attrs['aria-label']);
    else if (c.tag !== 'input' && c.tag !== 'select' && c.tag !== 'textarea') parts.push(textOf(c, skip));
  }
  return squash(parts.join(' '));
}

function referenced(ids: string | undefined, index: Index): string {
  return squash(
    (ids ?? '')
      .split(/\s+/)
      .map((id) => index.byId.get(id))
      .map((n) => (n ? textOf(n) : ''))
      .join(' '),
  );
}

function nameOf(node: AxNode, role: string, index: Index): string {
  const { attrs, tag } = node;
  const byIds = referenced(attrs['aria-labelledby'], index);
  if (byIds) return byIds;
  if (squash(attrs['aria-label'] ?? '')) return squash(attrs['aria-label']!);
  if (tag === 'input' || tag === 'select' || tag === 'textarea') {
    const type = (attrs.type ?? '').toLowerCase();
    if (['button', 'submit', 'reset'].includes(type) && attrs.value) return squash(attrs.value);
    const labels = [
      ...(attrs.id ? (index.labelsFor.get(attrs.id) ?? []) : []),
      ...(index.wrappingLabel.has(node) ? [index.wrappingLabel.get(node)!] : []),
    ];
    const fromLabels = squash(labels.map((l) => textOf(l, node)).join(' '));
    if (fromLabels) return fromLabels;
  }
  if (tag === 'img' && squash(attrs.alt ?? '')) return squash(attrs.alt!);
  if (NAMED_FROM_CONTENT.has(role)) {
    const content = textOf(node);
    if (content) return content;
  }
  return squash(attrs.title ?? '');
}

/** The role word and states said for a node with `role`. */
function voiced(node: AxNode, role: string): { word: string; states: string[] } {
  const { attrs, tag } = node;
  const states: string[] = [];
  let word = ROLE_WORDS[role]!;

  if (role === 'heading') {
    const level = /^h([1-6])$/.exec(tag)?.[1] ?? attrs['aria-level'] ?? '2';
    states.push(`level ${level}`);
  }
  const pressed = attrs['aria-pressed'];
  if (role === 'button' && (pressed === 'true' || pressed === 'false' || pressed === 'mixed')) {
    word = 'toggle button';
    states.push(pressed === 'true' ? 'pressed' : pressed === 'mixed' ? 'half pressed' : 'not pressed');
  }
  if (role === 'checkbox' || role === 'radio' || role === 'switch') {
    const native = tag === 'input' && !attrs.role;
    const checked = native ? (node.checked ?? 'checked' in attrs) : attrs['aria-checked'];
    const on = checked === true || checked === 'true';
    const known = native || checked === 'true' || checked === 'false';
    if (known && role === 'switch') states.push(on ? 'on' : 'off');
    else if (known) states.push(on ? 'checked' : 'not checked');
  }
  if (attrs['aria-expanded'] === 'true') states.push('expanded');
  if (attrs['aria-expanded'] === 'false') states.push('collapsed');
  if ('required' in attrs || attrs['aria-required'] === 'true') states.push('required');
  if (attrs['aria-invalid'] === 'true') states.push('invalid entry');
  return { word, states };
}

/** What a screen reader would say for `root` and everything in it, in reading order. */
export function announce(root: AxNode): Announcement[] {
  const index = indexOf(root);
  const lines: Announcement[] = [];
  let run: { text: string[]; lang?: string } | null = null;

  const flush = () => {
    const name = run ? squash(run.text.join(' ')) : '';
    if (run && name) {
      lines.push({ name, role: null, states: [], description: '', ...(run.lang ? { lang: run.lang } : {}) });
    }
    run = null;
  };

  const walk = (node: AxNode, lang: string | undefined, isRoot: boolean) => {
    if (!isRoot && isHidden(node)) return;
    const here = node.attrs.lang || lang;
    const role = roleOf(node);
    if (role) {
      flush();
      const { word, states } = voiced(node, role);
      lines.push({
        name: nameOf(node, role, index),
        role: word,
        states,
        description: referenced(node.attrs['aria-describedby'], index),
        ...(here ? { lang: here } : {}),
      });
      // A role named from its content has said that content already.
      if (NAMED_FROM_CONTENT.has(role) || node.tag === 'img' || node.tag === 'input') return;
    }
    const block = !INLINE.has(node.tag);
    if (block) flush();
    for (const c of node.children) {
      if (typeof c === 'string') {
        if (!c.trim()) continue;
        run ??= here ? { text: [], lang: here } : { text: [] };
        run.text.push(c);
      } else {
        walk(c, here, false);
      }
    }
    if (block) flush();
  };

  walk(root, undefined, true);
  flush();
  return lines;
}

/** One line as it is said: "Email notifications, switch, on". */
export function spoken({ name, role, states, description, lang }: Announcement): string {
  const said = [name, role, ...states, description].filter(Boolean).join(', ');
  return lang ? `${said} (${lang})` : said;
}

/** A plain copy of a rendered element, for `announce`. Browser only. */
export function fromDom(el: Element): AxNode {
  const attrs: Record<string, string> = {};
  for (const a of Array.from(el.attributes)) attrs[a.name] = a.value;
  const children: (AxNode | string)[] = [];
  for (const c of Array.from(el.childNodes)) {
    if (c.nodeType === 3) children.push(c.textContent ?? '');
    else if (c.nodeType === 1) children.push(fromDom(c as Element));
  }
  const tag = el.tagName.toLowerCase();
  const checked = tag === 'input' ? (el as HTMLInputElement).checked : undefined;
  return checked === undefined ? { tag, attrs, children } : { tag, attrs, checked, children };
}
