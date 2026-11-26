import { useId, useMemo, useRef, useState } from 'react';
import { AnnouncementLog, useAnnouncementLog } from '../shared/AnnouncementLog';
import {
  FIELDS,
  IP_START,
  autofillValue,
  ipSaid,
  ipVerdict,
  tokenFor,
  type Choice as Pick,
  type Purposes,
} from './inputPurpose';
import { LabShell, type Said } from '../shared/LabShell';
import { Choice } from '../name-role-value/NameRoleValueLab';

/**
 * The 1.3.5 lab (#49): the reader gives each mock contact field an autocomplete token, the right
 * one, an invented one, or none. A simulated browser autofill fills the fields whose token names
 * a purpose, and the announcement log reads what each field now holds.
 *
 * The mock is depicted: inert and hidden from assistive technology. The log speaks for it.
 */

type Model = { readonly purposes: Purposes; readonly heard: number };

const START: Model = { purposes: IP_START, heard: 0 };

export function InputPurposeLab() {
  const id = useId();
  const [{ purposes, heard }, setModel] = useState<Model>(START);
  const mock = useRef<HTMLDivElement>(null);
  const lines = useAnnouncementLog(mock, purposes);
  const said = useMemo<Said | null>(
    () => (heard > 0 ? { text: ipSaid(purposes) } : null),
    [heard, purposes],
  );

  return (
    <LabShell
      className="lab ip-lab"
      verdict={ipVerdict(purposes)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock ip-mock" data-lab-mock aria-hidden="true" inert ref={mock}>
        {FIELDS.map((f) => {
          const token = tokenFor(f, purposes[f.id]);
          return (
            <div key={f.id} className="ip-field">
              <label htmlFor={`${id}-${f.id}`}>{f.label}</label>
              <input
                id={`${id}-${f.id}`}
                type={f.type}
                tabIndex={-1}
                readOnly
                autoComplete={token}
                value={autofillValue(token)}
              />
            </div>
          );
        })}
      </div>

      <div className="lab-controls">
        {FIELDS.map((f) => (
          <Choice<Pick>
            key={f.id}
            name={`${id}-${f.id}-ac`}
            legend={f.label}
            options={[
              { value: 'none', label: 'No autocomplete' },
              { value: 'right', label: `autocomplete="${f.right}"` },
              { value: 'invented', label: `autocomplete="${f.invented}"` },
            ]}
            value={purposes[f.id]}
            onChange={(choice) =>
              setModel((m) => ({
                purposes: { ...m.purposes, [f.id]: choice },
                heard: m.heard + 1,
              }))
            }
          />
        ))}
      </div>

      <div className="lab-out">
        <div className="lab-code">
          <p className="alog__h">The markup</p>
          {FIELDS.map((f) => {
            const token = tokenFor(f, purposes[f.id]);
            return (
              <code key={f.id}>
                {`<input type="${f.type}"${token ? ` autocomplete="${token}"` : ''}>`}
              </code>
            );
          })}
        </div>
        <AnnouncementLog id={id} lines={lines} title="After autofill, a screen reader says" />
      </div>
    </LabShell>
  );
}
