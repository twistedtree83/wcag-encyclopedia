import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnnouncementLog, useAnnouncementLog } from './AnnouncementLog';
import { LabChoice } from './LabChoice';
import { LabShell, type Said } from './LabShell';
import {
  ALT_MAX,
  ALT_START,
  PRESETS,
  PURPOSES,
  altSaid,
  altVerdict,
  markupOfAlt,
  presetAlt,
  presetOf,
  type AltModel,
} from './altText';
import { altFromSearch, searchFromAlt } from './altQuery';
import { DIVIDER, PHOTO } from './pictures';

/**
 * The 1.1.1 flagship lab (#48): the reader writes the alt text for a mock image, from a preset
 * (left out, the file name, decorative, a description) or in their own words, and the log reads
 * the mock's markup to say what a screen reader would. The verdict passes when the photo is named
 * by what it shows, or the divider is marked decorative.
 *
 * The mock is depicted: inert and hidden from assistive technology, so an unnamed image is never
 * put in front of a real screen-reader user. State is in the URL (`altQuery.ts`), applied after
 * mount without being announced, as the 4.1.2 lab does.
 */

type Model = {
  readonly alt: AltModel;
  /** Counts the reader's changes; 0 at the start, after a URL preload and after Reset. */
  readonly heard: number;
};

const START: Model = { alt: ALT_START, heard: 0 };

/** The mock image, as a page author wrote it. */
export function AltMock({ model }: { readonly model: AltModel }) {
  const src = model.purpose === 'photo' ? PHOTO : DIVIDER;
  const alt = model.alt === null ? {} : { alt: model.alt };
  // The alt is exactly what the reader chose, including none at all: the mock depicts it.
  return <img className="alt-mock__img" src={src} width={160} height={120} {...alt} />;
}

export function AltTextLab() {
  const id = useId();
  const [{ alt: model, heard }, setModel] = useState<Model>(START);
  const mock = useRef<HTMLDivElement>(null);
  const lines = useAnnouncementLog(mock, model);

  // Only the reader's own changes are spoken: a preload and Reset leave `heard` at 0.
  const said = useMemo<Said | null>(
    () => (heard > 0 ? { text: altSaid(model, lines) } : null),
    [heard, lines, model],
  );

  useEffect(() => {
    const preload = altFromSearch(window.location.search);
    if (preload) setModel((m) => ({ ...m, alt: preload }));
  }, []);

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const { pathname, hash } = window.location;
    window.history.replaceState(window.history.state, '', pathname + searchFromAlt(model) + hash);
  }, [model]);

  const change = (next: (m: AltModel) => AltModel) =>
    setModel((m) => ({ alt: next(m.alt), heard: m.heard + 1 }));

  const preset = presetOf(model);
  return (
    <LabShell
      className="lab alt-lab"
      verdict={altVerdict(model)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock alt-mock" data-lab-mock aria-hidden="true" inert ref={mock}>
        <AltMock model={model} />
      </div>

      <div className="sem-controls">
        <LabChoice
          name={`${id}-img`}
          legend="The image"
          options={PURPOSES}
          value={model.purpose}
          onChange={(purpose) =>
            change((m) => {
              // A preset follows the image: "the file name" stays the file name.
              const was = presetOf(m);
              return { purpose, alt: was ? presetAlt(was, purpose) : m.alt };
            })
          }
        />
        <LabChoice
          name={`${id}-preset`}
          legend="Its alt text"
          options={PRESETS}
          value={preset}
          onChange={(p) => change((m) => ({ ...m, alt: presetAlt(p, m.purpose) }))}
        />
        <div className="sem-field">
          <label htmlFor={`${id}-alt`}>Or write your own alt text</label>
          <input
            id={`${id}-alt`}
            type="text"
            maxLength={ALT_MAX}
            autoComplete="off"
            value={model.alt ?? ''}
            onChange={(e) => {
              const alt = e.target.value;
              change((m) => ({ ...m, alt }));
            }}
          />
        </div>
      </div>

      <div className="nrv-out">
        <div className="nrv-code">
          <p className="alog__h">The markup</p>
          <code>{markupOfAlt(model)}</code>
        </div>
        <AnnouncementLog id={id} lines={lines} empty="Nothing. The image is skipped." />
      </div>
    </LabShell>
  );
}
