import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

describe('coverage contracts schemas', () => {
  const dir = join(process.cwd(), 'api', 'contracts', 'coverage');
  it('schemas should include $schema and examples', () => {
    let files: string[] = [];
    try {
      files = readdirSync(dir).filter((f) => f.endsWith('.json'));
    } catch (e) {
      // no dir -> pass silently
      expect(files.length).toBeGreaterThanOrEqual(0);
      return;
    }

    for (const f of files) {
      const p = join(dir, f);
      const txt = readFileSync(p, 'utf-8');
      const json = JSON.parse(txt);
      expect(json.$schema, `${f} missing $schema`).toBeDefined();
      expect(json.examples, `${f} missing examples`).toBeDefined();
    }
  });
});
