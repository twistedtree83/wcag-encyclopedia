import { useId, useMemo, useRef, useState } from 'react';
import { listOf } from '../../live/lists';
import { AnnouncementLog, useAnnouncementLog } from '../shared/AnnouncementLog';
import { LabShell, type Said } from '../shared/LabShell';
import {
  ITEMS,
  LINK_CONTEXTS,
  LINK_START,
  LINK_TEXTS,
  linkSaid,
  linkTextOf,
  linkVerdict,
  sentenceOf,
  type Links,
} from './linkPurpose';
import { Choice } from '../shared/Choice';

/**
 * The 2.4.4 lab (#50): the reader edits three news items' link text and the sentence before each
 * link, and a simulated links list, read from the mock's own markup, says the links out of
 * context. The verdict judges them in context, as 2.4.4 does.
 *
 * The mock is depicted: inert and hidden from assistive technology, so its vague links are never
 * put in front of a real screen-reader user. The log speaks for it.
 */

type Model = {
  readonly links: Links;
  /** Counts the reader's changes; 0 at the start and after Reset. */
  readonly heard: number;
};

const START: Model = { links: LINK_START, heard: 0 };

/** The three news items, as a page author might have written them. */
export function LinkMock({ links }: { readonly links: Links }) {
  return (
    <ul className="tlh-news">
      {ITEMS.map((item, i) => {
        const sentence = sentenceOf(links.context, i);
        return (
          <li key={item.href}>
            {sentence ? `${sentence} ` : null}
            <a href={item.href} tabIndex={-1}>
              {linkTextOf(links.text, i)}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function LinkPurposeLab() {
  const id = useId();
  const [{ links, heard }, setModel] = useState<Model>(START);
  const mock = useRef<HTMLDivElement>(null);
  const lines = useAnnouncementLog(mock, links);
  const list = useMemo(() => listOf(lines, 'links'), [lines]);

  // Only the reader's own changes are spoken: Reset leaves `heard` at 0.
  const said = useMemo<Said | null>(
    () => (heard > 0 ? { text: linkSaid(links, list) } : null),
    [heard, links, list],
  );

  const change = (patch: Partial<Links>) =>
    setModel((m) => ({ links: { ...m.links, ...patch }, heard: m.heard + 1 }));

  return (
    <LabShell
      className="lab tlh-lab link-lab"
      verdict={linkVerdict(links)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock tlh-mock" data-lab-mock aria-hidden="true" inert ref={mock}>
        <LinkMock links={links} />
      </div>

      <div className="tlh-controls">
        <Choice
          name={`${id}-text`}
          legend="Link text"
          options={LINK_TEXTS}
          value={links.text}
          onChange={(text) => change({ text })}
        />
        <Choice
          name={`${id}-context`}
          legend="The sentence before it"
          options={LINK_CONTEXTS}
          value={links.context}
          onChange={(context) => change({ context })}
        />
      </div>

      <AnnouncementLog id={id} lines={list} title="Links list says" />
    </LabShell>
  );
}
