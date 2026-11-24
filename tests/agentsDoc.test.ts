import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Risk R02 (Assignment #05): AGENTS.md fell out of date after new modules were added,
// so an agent got wrong instructions. This test makes that drift fail the build checks.
const doc = readFileSync('AGENTS.md', 'utf8');
const libModules = readdirSync('src/lib').filter(
  (f) => f.endsWith('.ts') && !f.endsWith('.test.ts')
);

describe('AGENTS.md stays in sync with the code', () => {
  it.each(libModules)('lists src/lib/%s in Structure', (file) => {
    expect(doc).toContain(`src/lib/${file}`);
  });

  it.each(['rm -rf', 'git reset --hard', 'git push --force'])(
    'forbids the destructive command "%s"',
    (command) => {
      expect(doc).toContain(command);
    }
  );

  it('keeps the human review gate', () => {
    expect(doc).toContain('wait for human approval');
  });
});
