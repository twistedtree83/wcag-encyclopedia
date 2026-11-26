// Reads Playwright's JSON report and prints the tests that only passed on a retry ("flaky")
// and the slowest 15 tests, so the local retry never hides a flake.
// Usage: node scripts/flaky.mjs [test-results/results.json]
import { existsSync, readFileSync } from 'node:fs';

const file = process.argv[2] ?? 'test-results/results.json';
if (!existsSync(file)) {
  console.log(`flaky: no report at ${file}`);
  process.exit(0);
}

const report = JSON.parse(readFileSync(file, 'utf8'));
const tests = [];

function visit(suite, path) {
  const here = suite.title ? [...path, suite.title] : path;
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const duration = (test.results ?? []).reduce((sum, r) => sum + (r.duration ?? 0), 0);
      tests.push({
        title: [...here, spec.title].join(' › '),
        where: `${spec.file}:${spec.line}`,
        project: test.projectName,
        status: test.status,
        duration,
      });
    }
  }
  for (const child of suite.suites ?? []) visit(child, here);
}
for (const suite of report.suites ?? []) visit(suite, []);

const flaky = tests.filter((t) => t.status === 'flaky');
console.log(`\nFlaky (passed only on retry): ${flaky.length}`);
for (const t of flaky) console.log(`  ${t.where}  ${t.title}`);

console.log('\nSlowest 15:');
for (const t of [...tests].sort((a, b) => b.duration - a.duration).slice(0, 15)) {
  console.log(`  ${(t.duration / 1000).toFixed(1).padStart(5)}s  ${t.where}  ${t.title}`);
}
