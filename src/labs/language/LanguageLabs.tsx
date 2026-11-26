import { useId, useMemo, useRef, useState } from 'react';
import { AnnouncementLog, useAnnouncementLog } from '../shared/AnnouncementLog';
import { LabShell, type Said } from '../shared/LabShell';
import { Choice } from '../name-role-value/NameRoleValueLab';
import {
  PAGE_LANGS,
  PHRASE,
  pageSaid,
  pageVerdict,
  partsSaid,
  partsVerdict,
  withVoices,
  type PageLang,
} from './language';

/**
 * The 3.1.1 and 3.1.2 labs (#51). The reader sets a mock page's `lang`, or marks a French phrase
 * with its own, and the announcement log, read from the mock's markup, names the voice each line
 * is read in. The real page's `lang` is never touched: only the depicted mock changes.
 *
 * The mocks are depicted, inert and hidden from assistive technology, as in the 4.1.2 lab.
 */

/** 3.1.1's mock: a short English page, with the `lang` the reader chose on its root. */
export function PageMock({ lang }: { readonly lang: PageLang }) {
  return (
    <div className="lang-page" lang={lang === 'none' ? undefined : lang}>
      <h4>Opening hours</h4>
      <p>Monday to Friday, nine till five. Closed on bank holidays.</p>
    </div>
  );
}

/** 3.1.2's mock: an English page with a French phrase, marked `lang="fr"` or not. */
export function PartsMock({ marked }: { readonly marked: boolean }) {
  return (
    <div className="lang-page" lang="en">
      <p>
        The sign on the door still read <em lang={marked ? 'fr' : undefined}>{PHRASE}</em>, which
        nobody obeyed.
      </p>
    </div>
  );
}

/** The markup the reader is editing, for the readout. */
function Code({ children }: { readonly children: string }) {
  return (
    <div className="nrv-code">
      <p className="alog__h">The markup</p>
      <code>{children}</code>
    </div>
  );
}

type PageModel = { readonly lang: PageLang; readonly heard: number };
const PAGE_START: PageModel = { lang: 'none', heard: 0 };

export function PageLanguageLab() {
  const id = useId();
  const [{ lang, heard }, setModel] = useState<PageModel>(PAGE_START);
  const mock = useRef<HTMLDivElement>(null);
  const lines = useAnnouncementLog(mock, lang);
  // Only the reader's own changes are spoken: Reset leaves `heard` at 0.
  const said = useMemo<Said | null>(() => (heard > 0 ? { text: pageSaid(lang) } : null), [heard, lang]);

  return (
    <LabShell
      className="lab lang-lab"
      verdict={pageVerdict(lang)}
      said={said}
      onReset={() => setModel(PAGE_START)}
    >
      <div className="lab__mock nrv-mock" data-lab-mock aria-hidden="true" inert ref={mock}>
        <PageMock lang={lang} />
      </div>
      <div className="lang-controls">
        <Choice
          name={`${id}-lang`}
          legend="The page’s lang attribute"
          options={PAGE_LANGS}
          value={lang}
          onChange={(next) => setModel((m) => ({ lang: next, heard: m.heard + 1 }))}
        />
        <p className="lang-note">The page is in English. The reader’s screen reader is set to German.</p>
      </div>
      <div className="nrv-out">
        <Code>{lang === 'none' ? '<html>' : `<html lang="${lang}">`}</Code>
        <AnnouncementLog id={id} lines={withVoices(lines)} />
      </div>
    </LabShell>
  );
}

type PartsModel = { readonly marked: boolean; readonly heard: number };
const PARTS_START: PartsModel = { marked: false, heard: 0 };

export function PartsLanguageLab() {
  const id = useId();
  const [{ marked, heard }, setModel] = useState<PartsModel>(PARTS_START);
  const mock = useRef<HTMLDivElement>(null);
  const lines = useAnnouncementLog(mock, marked);
  const said = useMemo<Said | null>(
    () => (heard > 0 ? { text: partsSaid(marked) } : null),
    [heard, marked],
  );

  return (
    <LabShell
      className="lab lang-lab"
      verdict={partsVerdict(marked)}
      said={said}
      onReset={() => setModel(PARTS_START)}
    >
      <div className="lab__mock nrv-mock" data-lab-mock aria-hidden="true" inert ref={mock}>
        <PartsMock marked={marked} />
      </div>
      <label className="nrv-on">
        <input
          type="checkbox"
          checked={marked}
          onChange={(e) => setModel((m) => ({ marked: e.target.checked, heard: m.heard + 1 }))}
        />
        Mark the phrase lang="fr"
      </label>
      <div className="nrv-out">
        <Code>{marked ? `<em lang="fr">${PHRASE}</em>` : `<em>${PHRASE}</em>`}</Code>
        <AnnouncementLog id={id} lines={withVoices(lines)} />
      </div>
    </LabShell>
  );
}
