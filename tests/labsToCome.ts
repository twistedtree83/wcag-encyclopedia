/**
 * Criteria still waiting for their first lab. The lab-coverage check in `criteria.test.ts`
 * skips these, and fails if one of them gains a lab while it is still listed here.
 *
 * Shrink-only: when your ticket gives a criterion its first lab, delete its line. Never add one.
 * The list is empty once every criterion has a lab (L-27).
 *
 * One criterion per line with a blank line between entries, so tickets running in parallel each
 * delete their own line without a merge conflict. Keep it that way.
 */
export const LABS_TO_COME: readonly string[] = [
  '1.2.1',

  '1.2.2',

  '1.2.3',

  '1.2.4',

  '1.2.5',

  '1.3.4',

  '1.4.2',

  '1.4.4',

  '1.4.5',

  '1.4.12',

  '2.2.1',

  '2.2.2',

  '2.3.1',

  '2.5.1',

  '2.5.2',

  '2.5.4',

  '2.5.7',

  '3.2.4',

  '3.2.6',

  '3.3.7',

  '3.3.8',

];
