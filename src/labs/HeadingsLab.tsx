import { useId, useMemo, useRef, useState } from 'react';
import { listOf } from '../live/lists';
import { AnnouncementLog, useAnnouncementLog } from './AnnouncementLog';
import {
  DOC_START,
  HEADINGS,
  HEADING_CHOICES,
  LABELS,
  LABEL_CHOICES,
  docSaid,
  docVerdict,
  type Doc,
} from './headingsLabels';
import { LabShell, type Said } from './LabShell';
import { Choice } from './NameRoleValueLab';

/**
 * The 2.4.6 lab (#50): the reader rewrites a mock returns page's headings and its field's label,
 * and a simulated headings-and-fields list, read from the mock's own markup, says them as a
 * screen reader user skimming the page would hear them.
 *
 * The mock is depicted: inert and hidden from assistive technology, so its headings never enter
 * the real page's outline. Its levels (4, then 5) nest under the lab's own h3.
 */

type Model = {
  readonly doc: Doc;
  /** Counts the reader's changes; 0 at the start and after Reset. */
  readonly heard: number;
};

const START: Model = { doc: DOC_START, heard: 0 };

/** The returns page, as a page author might have written it. */
export function HeadingsMock({ doc }: { readonly doc: Doc }) {
  const [page, first, second] = HEADINGS[doc.headings];
  return (
    <div className="tlh-doc">
      <h4>{page}</h4>
      <h5>{first}</h5>
      <p>30 days from the day it arrives.</p>
      <h5>{second}</h5>
      <p>Nothing: returns are free.</p>
      <label>
        {LABELS[doc.label]}
        <input type="text" tabIndex={-1} />
      </label>
    </div>
  );
}

export function HeadingsLab() {
  const id = useId();
  const [{ doc, heard }, setModel] = useState<Model>(START);
  const mock = useRef<HTMLDivElement>(null);
  const lines = useAnnouncementLog(mock, doc);
  const list = useMemo(() => listOf(lines, 'outline'), [lines]);

  // Only the reader's own changes are spoken: Reset leaves `heard` at 0.
  const said = useMemo<Said | null>(
    () => (heard > 0 ? { text: docSaid(doc, list) } : null),
    [heard, doc, list],
  );

  const change = (patch: Partial<Doc>) =>
    setModel((m) => ({ doc: { ...m.doc, ...patch }, heard: m.heard + 1 }));

  return (
    <LabShell
      className="lab tlh-lab headings-lab"
      verdict={docVerdict(doc)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock tlh-mock" data-lab-mock aria-hidden="true" inert ref={mock}>
        <HeadingsMock doc={doc} />
      </div>

      <div className="tlh-controls">
        <Choice
          name={`${id}-headings`}
          legend="Headings"
          options={HEADING_CHOICES}
          value={doc.headings}
          onChange={(headings) => change({ headings })}
        />
        <Choice
          name={`${id}-label`}
          legend="The field’s label"
          options={LABEL_CHOICES}
          value={doc.label}
          onChange={(label) => change({ label })}
        />
      </div>

      <AnnouncementLog id={id} lines={list} title="Headings and fields list says" />
    </LabShell>
  );
}
