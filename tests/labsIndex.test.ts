import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { criterion } from '../src/criteria/corpus';
import { LAB_FOLDERS } from '../src/labs/registry';

/**
 * `src/labs/INDEX.md`, generated from the registry so it cannot drift: lab → criteria → folder.
 * Regenerate it with `npm run labs:index` (this file, with UPDATE_LABS_INDEX=1).
 */

const FILE = 'src/labs/INDEX.md';

const numKey = (num: string) => num.split('.').map((n) => n.padStart(3, '0')).join('.');

function labsIndex(): string {
  const rows = [...LAB_FOLDERS]
    .sort(
      (a, b) =>
        numKey([...a.lab.criteria].sort((x, y) => numKey(x).localeCompare(numKey(y)))[0] ?? '').localeCompare(
          numKey([...b.lab.criteria].sort((x, y) => numKey(x).localeCompare(numKey(y)))[0] ?? ''),
        ) || a.lab.id.localeCompare(b.lab.id),
    )
    .map(({ folder, lab }) => {
      const criteria = [...lab.criteria]
        .sort((x, y) => numKey(x).localeCompare(numKey(y)))
        .map((num) => `${num} ${criterion(num)?.name ?? '?'}${lab.flagshipFor === num ? ' (flagship)' : ''}`)
        .join('; ');
      return `| \`${lab.id}\` | ${lab.title} | ${criteria} | [\`${folder}/\`](./${folder}/) |`;
    });
  return [
    '# Labs',
    '',
    '<!-- Generated from src/labs/registry.ts by `npm run labs:index`. Do not edit by hand. -->',
    '',
    // No totals line: two branches that each add a lab then merge cleanly (`merge=union` in
    // .gitattributes), and this test asks for a regenerate if the rows land out of order.
    "Each folder's `lab.ts` registers its labs; `shared/` holds what every lab uses.",
    '',
    '| Lab | Title | Criteria | Folder |',
    '|---|---|---|---|',
    ...rows,
    '',
  ].join('\n');
}

describe('src/labs/INDEX.md', () => {
  it('matches the registry (run `npm run labs:index` to regenerate)', () => {
    const want = labsIndex();
    if (process.env.UPDATE_LABS_INDEX) writeFileSync(FILE, want);
    expect(existsSync(FILE), `${FILE} is missing: run npm run labs:index`).toBe(true);
    expect(readFileSync(FILE, 'utf8'), `${FILE} is stale: run npm run labs:index`).toBe(want);
  });
});
