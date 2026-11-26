import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { CORPUS } from '../src/criteria/corpus';
import { LAB_FOLDERS, collectLabs, type LabEntry } from '../src/labs/registry';

/**
 * The self-registering lab folders (ADR 0004): `src/labs/<lab>/lab.ts` registers a lab, and the
 * registry collects them with `import.meta.glob`. These hold the folders to that contract.
 */

const LABS_DIR = 'src/labs';
/** Folders under src/labs that hold no lab: the pieces every lab uses. */
const NOT_LABS = new Set(['shared']);

const lab = (id: string, criteria: readonly string[] = ['1.4.3']): LabEntry => ({
  id,
  title: `Try it: ${id}`,
  criteria,
  Lab: () => null,
});

describe('collectLabs', () => {
  it('flattens single and multi-lab modules in folder order', () => {
    const labs = collectLabs({
      './b/lab.ts': { default: [lab('b1'), lab('b2')] },
      './a/lab.ts': { default: lab('a') },
    });
    expect(labs.map((l) => `${l.folder}:${l.lab.id}`)).toEqual(['a:a', 'b:b1', 'b:b2']);
  });

  it('fails on a lab id registered twice', () => {
    expect(() =>
      collectLabs({ './a/lab.ts': { default: lab('same') }, './b/lab.ts': { default: lab('same') } }),
    ).toThrow(/"same" is registered by a and b/);
  });

  it('fails on a criterion listed twice by one lab', () => {
    expect(() => collectLabs({ './a/lab.ts': { default: lab('a', ['1.4.3', '1.4.3']) } })).toThrow(
      /1\.4\.3 twice/,
    );
  });

  it('fails on a lab.ts that registers nothing', () => {
    expect(() => collectLabs({ './a/lab.ts': { default: [] } })).toThrow(/registers no lab/);
  });
});

describe('the lab folders', () => {
  const folders = readdirSync(LABS_DIR).filter((n) => statSync(join(LABS_DIR, n)).isDirectory());

  it('give every folder under src/labs a lab.ts, except shared/', () => {
    const missing = folders.filter((f) => !NOT_LABS.has(f) && !existsSync(join(LABS_DIR, f, 'lab.ts')));
    expect(missing, 'add a lab.ts, or move the files into shared/').toEqual([]);
  });

  it('register every lab folder, and nothing from shared/', () => {
    const registered = new Set(LAB_FOLDERS.map((l) => l.folder));
    expect([...registered].sort()).toEqual(folders.filter((f) => !NOT_LABS.has(f)).sort());
  });

  it('keep only folders at the top of src/labs, apart from the registry and its index', () => {
    const files = readdirSync(LABS_DIR).filter((n) => statSync(join(LABS_DIR, n)).isFile());
    expect(files.sort()).toEqual(['INDEX.md', 'registry.ts']);
  });
});

describe('each lab’s criteria', () => {
  it.each(LAB_FOLDERS.map((l) => [l.lab.id, l.lab] as const))(
    '%s names exactly the criteria whose records list it',
    (id, entry) => {
      const listing = CORPUS.filter((c) => (c.labs ?? []).includes(id)).map((c) => c.num);
      expect([...entry.criteria].sort()).toEqual([...listing].sort());
    },
  );

  it.each(LAB_FOLDERS.filter((l) => l.lab.flagshipFor).map((l) => [l.lab.id, l.lab] as const))(
    '%s is shown on the criterion it is the flagship for',
    (_id, entry) => {
      expect(entry.criteria).toContain(entry.flagshipFor);
    },
  );
});
