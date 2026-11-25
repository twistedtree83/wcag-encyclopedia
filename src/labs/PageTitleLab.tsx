import { useId, useState } from 'react';
import { tabSwitchLine } from '../live/lists';
import { AnnouncementLog } from './AnnouncementLog';
import { LabShell, type Said } from './LabShell';
import { Choice } from './NameRoleValueLab';
import {
  ADDRESS,
  TITLES,
  TITLE_START,
  tabLabel,
  titleSaid,
  titleText,
  titleVerdict,
  type TitleChoice,
} from './pageTitle';

/**
 * The 2.4.2 lab (#50): the reader picks a mock checkout page's title (empty, generic or
 * descriptive) and hears it as a simulated switch to its browser tab. The real page's own title
 * is never changed.
 *
 * The browser is depicted: inert and hidden from assistive technology. The log speaks for it.
 */

type Model = { readonly title: TitleChoice; readonly said: Said | null };

const START: Model = { title: TITLE_START, said: null };

/** The other tabs open beside the checkout page. */
const OTHER_TABS = ['Inbox — Mail', 'Order history — Acme'];

export function PageTitleLab() {
  const id = useId();
  const [{ title, said }, setModel] = useState<Model>(START);

  return (
    <LabShell
      className="lab tlh-lab title-lab"
      verdict={titleVerdict(title)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock tlh-mock tlh-browser" data-lab-mock aria-hidden="true" inert>
        <div className="tabs">
          {OTHER_TABS.map((t) => (
            <span className="tabs__tab" key={t}>
              {t}
            </span>
          ))}
          <span className="tabs__tab tabs__tab--on">{tabLabel(title)}</span>
        </div>
        <p className="tlh-address">{ADDRESS}</p>
        <p className="tlh-page">
          <strong>Delivery details</strong> Where should we send your order?
        </p>
      </div>

      <div className="tlh-controls">
        <Choice
          name={`${id}-title`}
          legend="The page’s title"
          options={TITLES}
          value={title}
          onChange={(next) => setModel({ title: next, said: { text: titleSaid(next) } })}
        />
      </div>

      <AnnouncementLog
        id={id}
        lines={[tabSwitchLine(titleText(title), ADDRESS)]}
        title="Switching to its tab, a screen reader says"
      />
    </LabShell>
  );
}
